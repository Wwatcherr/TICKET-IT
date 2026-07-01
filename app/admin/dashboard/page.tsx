'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { timeAgo, STATUS_CONFIG, CATEGORY_CONFIG, PRIORITY_CONFIG } from '@/lib/utils'

interface StatsData {
  stats: { total_open: number; in_progress: number; urgent: number; resolved_today: number; total_tickets: number }
  by_status: Record<string, number>
  by_category: Record<string, number>
  by_priority: Record<string, number>
  recent_activity: Array<{ id: string; action: string; performed_by: string; created_at: string; ticket?: { ticket_number: string; title: string } }>
  weekly_chart: Array<{ date: string; count: number }>
}

const STAT_CARDS = [
  { key: 'total_open',     label: 'Tickets ouverts',  icon: '🎫', color: 'blue',   href: '/admin/tickets?status=nouveau' },
  { key: 'in_progress',    label: 'En cours',          icon: '⏳', color: 'amber',  href: '/admin/tickets?status=en_cours' },
  { key: 'urgent',         label: 'Urgents / Bloquants', icon: '🔴', color: 'red', href: '/admin/tickets?priority=urgente' },
  { key: 'resolved_today', label: 'Résolus aujourd\'hui', icon: '✅', color: 'green', href: '/admin/tickets?status=resolu' },
]

const COLOR_MAP: Record<string, string> = {
  blue: 'text-blue-600 bg-blue-50', amber: 'text-amber-600 bg-amber-50',
  red: 'text-red-600 bg-red-50', green: 'text-green-600 bg-green-50',
}

const PIE_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4']

export default function DashboardPage() {
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))

    // Auto-refresh every 60s
    const interval = setInterval(() => {
      fetch('/api/admin/stats').then(r => r.json()).then(setData)
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-xl" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-xl" />
            <div className="h-64 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  const statusPieData = Object.entries(data?.by_status || {}).map(([k, v]) => ({
    name: STATUS_CONFIG[k as keyof typeof STATUS_CONFIG]?.label || k,
    value: v,
  }))

  const categoryBarData = Object.entries(data?.by_category || {})
    .sort(([,a],[,b]) => b - a)
    .slice(0, 6)
    .map(([k, v]) => ({
      name: CATEGORY_CONFIG[k as keyof typeof CATEGORY_CONFIG]?.label || k,
      tickets: v,
    }))

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="text-sm text-gray-500 mt-1">Vue d'ensemble en temps réel</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2 border">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          Mis à jour en direct
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(card => {
          const value = data?.stats[card.key as keyof typeof data.stats] ?? 0
          return (
            <Link key={card.key} href={card.href} className="stat-card group cursor-pointer hover:border-brand-200">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${COLOR_MAP[card.color]}`}>
                  <span className="text-xl">{card.icon}</span>
                </div>
                <svg className="w-4 h-4 text-gray-300 group-hover:text-brand-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
              <div className="text-xs text-gray-500">{card.label}</div>
            </Link>
          )
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="section-header">
            <div className="section-title">Tickets cette semaine</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data?.weekly_chart || []}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                formatter={(v) => [`${v} ticket${Number(v) > 1 ? 's' : ''}`, '']}
              />
              <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#grad)" dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status pie */}
        <div className="card p-6">
          <div className="section-header">
            <div className="section-title">Par statut</div>
          </div>
          {statusPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {statusPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Aucune donnée</div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category bar chart */}
        <div className="card p-6">
          <div className="section-header">
            <div className="section-title">Par catégorie</div>
          </div>
          {categoryBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryBarData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} width={70} />
                <Tooltip contentStyle={{ border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="tickets" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Aucune donnée</div>
          )}
        </div>

        {/* Recent activity */}
        <div className="card p-6">
          <div className="section-header">
            <div className="section-title">Activité récente</div>
            <Link href="/admin/tickets" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
              Voir tout →
            </Link>
          </div>
          <div className="space-y-3">
            {data?.recent_activity?.length ? data.recent_activity.slice(0, 6).map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <div className="w-7 h-7 bg-brand-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">{a.performed_by}</span>
                    {' · '}
                    <span className="text-gray-500">{a.action}</span>
                  </div>
                  {a.ticket && (
                    <Link href={`/admin/tickets/${a.ticket.ticket_number}`} className="text-xs text-brand-600 hover:underline truncate block">
                      {a.ticket.ticket_number} — {a.ticket.title}
                    </Link>
                  )}
                  <div className="text-xs text-gray-400 mt-0.5">{timeAgo(a.created_at)}</div>
                </div>
              </div>
            )) : (
              <div className="text-sm text-gray-400 text-center py-8">Aucune activité récente</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
