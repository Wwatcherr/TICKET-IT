import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { generateTicketNumber } from '@/lib/utils'
import { sendTicketConfirmation, sendNewTicketNotification } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const ticket_number = generateTicketNumber()
    const supabase = createAdminClient()

    // Upload attachments
    const files = formData.getAll('files') as File[]
    const attachmentUrls: string[] = []

    for (const file of files) {
      if (file.size === 0) continue
      const buffer = Buffer.from(await file.arrayBuffer())
      const fileName = `${ticket_number}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
      
      const { data, error } = await supabase.storage
        .from('ticket-attachments')
        .upload(fileName, buffer, { contentType: file.type })

      if (!error && data) {
        const { data: url } = supabase.storage
          .from('ticket-attachments')
          .getPublicUrl(data.path)
        attachmentUrls.push(url.publicUrl)
      }
    }

    // Create ticket
    const ticketData = {
      ticket_number,
      requester_name:    formData.get('requester_name') as string,
      requester_email:   formData.get('requester_email') as string,
      requester_service: formData.get('requester_service') as string,
      requester_site:    formData.get('requester_site') as string,
      request_date:      formData.get('request_date') as string,
      affected_person:   formData.get('affected_person') as string || null,
      category:          formData.get('category') as string,
      priority:          formData.get('priority') as string,
      title:             formData.get('title') as string,
      description:       formData.get('description') as string,
      equipment:         formData.get('equipment') as string || null,
      email_consent:     formData.get('email_consent') === 'true',
      status:            'nouveau',
      attachments:       attachmentUrls.length > 0 ? attachmentUrls : null,
    }

    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert(ticketData)
      .select()
      .single()

    if (ticketError) throw ticketError

    // Log activity
    await supabase.from('ticket_activities').insert({
      ticket_id: ticket.id,
      action: 'Ticket créé',
      new_value: ticket.status,
      performed_by: ticket.requester_name,
    })

    // Send emails (non-blocking)
    try {
      await Promise.allSettled([
        sendTicketConfirmation(ticket),
        sendNewTicketNotification(ticket),
      ])
    } catch (emailErr) {
      console.error('Email error (non-fatal):', emailErr)
    }

    return NextResponse.json({ 
      success: true, 
      ticket_number: ticket.ticket_number,
      id: ticket.id 
    })

  } catch (error) {
    console.error('Create ticket error:', error)
    return NextResponse.json(
      { error: 'Impossible de créer le ticket. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const url = new URL(req.url)
    
    const page = Number(url.searchParams.get('page') || '1')
    const perPage = Number(url.searchParams.get('per_page') || '20')
    const search = url.searchParams.get('search') || ''
    const status = url.searchParams.get('status') || ''
    const priority = url.searchParams.get('priority') || ''
    const category = url.searchParams.get('category') || ''
    const sortBy = url.searchParams.get('sort_by') || 'created_at'
    const sortOrder = url.searchParams.get('sort_order') || 'desc'

    let query = supabase
      .from('tickets')
      .select('*, assigned_user:admin_users(id, full_name, email)', { count: 'exact' })

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,requester_name.ilike.%${search}%,ticket_number.ilike.%${search}%,description.ilike.%${search}%`
      )
    }
    if (status && status !== 'all') query = query.eq('status', status)
    if (priority && priority !== 'all') query = query.eq('priority', priority)
    if (category && category !== 'all') query = query.eq('category', category)

    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range((page - 1) * perPage, page * perPage - 1)

    const { data, error, count } = await query
    if (error) throw error

    return NextResponse.json({ data, count, page, perPage })
  } catch (error) {
    console.error('Get tickets error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
