import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import * as XLSX from 'xlsx'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || ''
    const statut = searchParams.get('statut') || ''
    const site = searchParams.get('site') || ''

    let query = supabase
      .from('inventaire')
      .select('*')
      .order('code_interne', { ascending: true })

    if (type && type !== 'all') query = query.eq('type_materiel', type)
    if (statut && statut !== 'all') query = query.eq('statut_inventaire', statut)
    if (site && site !== 'all') query = query.eq('site', site)

    const { data, error } = await query
    if (error) throw error

    const rows = (data || []).map(item => ({
      'Code interne':         item.code_interne || '',
      'Site':                 item.site || '',
      'Service':              item.service || '',
      'Collaborateur':        item.collaborateur || '',
      'Responsable':          item.responsable || '',
      'Type de matériel':     item.type_materiel || '',
      'Marque':               item.marque || '',
      'Modèle':               item.modele || '',
      'Numéro de série':      item.numero_serie || '',
      'Numéro de téléphone':  item.numero_telephone || '',
      'Accessoires':          item.accessoires || '',
      "Date d'ajout":         item.date_ajout ? new Date(item.date_ajout).toLocaleDateString('fr-FR') : '',
      'Date de remise':       item.date_remise ? new Date(item.date_remise).toLocaleDateString('fr-FR') : '',
      'Date de restitution':  item.date_restitution ? new Date(item.date_restitution).toLocaleDateString('fr-FR') : '',
      'Statut inventaire':    item.statut_inventaire || '',
      'Disponibilité':        item.disponibilite || '',
      'État remise':          item.etat_remise || '',
      'État restitution':     item.etat_restitution || '',
      'Commentaires':         item.commentaires || '',
      'Tickets liés':         item.nb_tickets || 0,
      'Dernière mise à jour': item.updated_at ? new Date(item.updated_at).toLocaleDateString('fr-FR') : '',
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(rows)

    // Largeurs des colonnes
    ws['!cols'] = [
      { wch: 16 }, { wch: 12 }, { wch: 20 }, { wch: 28 }, { wch: 20 },
      { wch: 14 }, { wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 18 },
      { wch: 28 }, { wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 18 },
      { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 28 }, { wch: 10 },
      { wch: 18 },
    ]

    // Style header (ligne 1 en gras + fond bleu)
    const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1')
    for (let c = headerRange.s.c; c <= headerRange.e.c; c++) {
      const cell = XLSX.utils.encode_cell({ r: 0, c })
      if (!ws[cell]) continue
      ws[cell].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '0284C7' } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: {
          bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
          right:  { style: 'thin', color: { rgb: 'CCCCCC' } },
        },
      }
    }

    // Figer la première ligne
    ws['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft' }

    XLSX.utils.book_append_sheet(wb, ws, 'Inventaire IT')

    // Feuille de stats
    const byType: Record<string, number> = {}
    const byStatut: Record<string, number> = {}
    const bySite: Record<string, number> = {}
    ;(data || []).forEach(item => {
      byType[item.type_materiel] = (byType[item.type_materiel] || 0) + 1
      byStatut[item.statut_inventaire] = (byStatut[item.statut_inventaire] || 0) + 1
      bySite[item.site || 'Non défini'] = (bySite[item.site || 'Non défini'] || 0) + 1
    })

    const statsRows = [
      ['RÉSUMÉ INVENTAIRE IT', '', ''],
      ['Date export', new Date().toLocaleDateString('fr-FR'), ''],
      ['Total appareils', (data || []).length, ''],
      ['', '', ''],
      ['PAR TYPE', 'Nombre', ''],
      ...Object.entries(byType).sort(([,a],[,b]) => b - a).map(([k, v]) => [k, v, '']),
      ['', '', ''],
      ['PAR STATUT', 'Nombre', ''],
      ...Object.entries(byStatut).map(([k, v]) => [k, v, '']),
      ['', '', ''],
      ['PAR SITE', 'Nombre', ''],
      ...Object.entries(bySite).sort(([,a],[,b]) => b - a).map(([k, v]) => [k, v, '']),
    ]

    const wsStats = XLSX.utils.aoa_to_sheet(statsRows)
    wsStats['!cols'] = [{ wch: 24 }, { wch: 12 }, { wch: 12 }]
    XLSX.utils.book_append_sheet(wb, wsStats, 'Résumé')

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx', cellStyles: true })
    const date = new Date().toISOString().split('T')[0]

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="inventaire-it-${date}.xlsx"`,
      },
    })
  } catch (error) {
    console.error('Export inventaire error:', error)
    return NextResponse.json({ error: 'Erreur export' }, { status: 500 })
  }
}
