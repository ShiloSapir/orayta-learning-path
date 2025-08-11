import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StatsQuery {
  from?: string
  to?: string
  topic?: string
  time_bucket?: number
  locale?: string
  platform?: string
  export?: boolean
}

interface KPIs {
  dau: number
  wau: number
  mau: number
  topic_mix: Record<string, number>
  time_bucket_usage: Record<string, number>
  ctr: number
  completion_rate: number
  error_rate: number
}

async function calculateKPIs(supabase: any, query: StatsQuery): Promise<KPIs> {
  const fromDate = query.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const toDate = query.to || new Date().toISOString()

  // Calculate DAU, WAU, MAU
  const { data: dauData } = await supabase
    .from('events')
    .select('user_id')
    .eq('event_type', 'topic_selected')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .not('user_id', 'is', null)

  const { data: wauData } = await supabase
    .from('events')
    .select('user_id')
    .eq('event_type', 'topic_selected')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .not('user_id', 'is', null)

  const { data: mauData } = await supabase
    .from('events')
    .select('user_id')
    .eq('event_type', 'topic_selected')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .not('user_id', 'is', null)

  // Calculate topic mix
  const { data: topicData } = await supabase
    .from('events')
    .select('event_data')
    .eq('event_type', 'topic_selected')
    .gte('created_at', fromDate)
    .lte('created_at', toDate)

  const topicCounts: Record<string, number> = {}
  topicData?.forEach((event: any) => {
    const topic = event.event_data?.topic
    if (topic) {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1
    }
  })

  const totalTopics = Object.values(topicCounts).reduce((a, b) => a + b, 0)
  const topicMix: Record<string, number> = {}
  Object.entries(topicCounts).forEach(([topic, count]) => {
    topicMix[topic] = totalTopics > 0 ? (count / totalTopics) * 100 : 0
  })

  // Calculate time bucket usage
  const timeBucketCounts: Record<string, number> = {}
  topicData?.forEach((event: any) => {
    const timeBucket = event.event_data?.time_bucket?.toString()
    if (timeBucket) {
      timeBucketCounts[timeBucket] = (timeBucketCounts[timeBucket] || 0) + 1
    }
  })

  const totalTimeBuckets = Object.values(timeBucketCounts).reduce((a, b) => a + b, 0)
  const timeBucketUsage: Record<string, number> = {}
  Object.entries(timeBucketCounts).forEach(([bucket, count]) => {
    timeBucketUsage[bucket] = totalTimeBuckets > 0 ? (count / totalTimeBuckets) * 100 : 0
  })

  // Calculate CTR (click-through rate)
  const { data: recommendationEvents } = await supabase
    .from('events')
    .select('id')
    .eq('event_type', 'recommendation_shown')
    .gte('created_at', fromDate)
    .lte('created_at', toDate)

  const { data: clickEvents } = await supabase
    .from('events')
    .select('id')
    .eq('event_type', 'link_clicked')
    .gte('created_at', fromDate)
    .lte('created_at', toDate)

  const ctr = recommendationEvents?.length > 0 
    ? (clickEvents?.length || 0) / recommendationEvents.length * 100 
    : 0

  // Calculate error rate
  const { data: errorEvents } = await supabase
    .from('events')
    .select('id')
    .not('error_code', 'is', null)
    .gte('created_at', fromDate)
    .lte('created_at', toDate)

  const { data: totalEvents } = await supabase
    .from('events')
    .select('id')
    .gte('created_at', fromDate)
    .lte('created_at', toDate)

  const errorRate = totalEvents?.length > 0 
    ? (errorEvents?.length || 0) / totalEvents.length * 100 
    : 0

  return {
    dau: new Set(dauData?.map((d: any) => d.user_id)).size,
    wau: new Set(wauData?.map((d: any) => d.user_id)).size,
    mau: new Set(mauData?.map((d: any) => d.user_id)).size,
    topic_mix: topicMix,
    time_bucket_usage: timeBucketUsage,
    ctr: Math.round(ctr * 100) / 100,
    completion_rate: 75, // Mock value - would need session tracking
    error_rate: Math.round(errorRate * 100) / 100
  }
}

async function getTimeSeries(supabase: any, query: StatsQuery) {
  const fromDate = query.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const toDate = query.to || new Date().toISOString()

  // Daily recommendations
  const { data: dailyRecommendations } = await supabase
    .from('events')
    .select('created_at')
    .eq('event_type', 'recommendation_shown')
    .gte('created_at', fromDate)
    .lte('created_at', toDate)
    .order('created_at')

  // Daily clicks
  const { data: dailyClicks } = await supabase
    .from('events')
    .select('created_at')
    .eq('event_type', 'link_clicked')
    .gte('created_at', fromDate)
    .lte('created_at', toDate)
    .order('created_at')

  // Daily errors
  const { data: dailyErrors } = await supabase
    .from('events')
    .select('created_at')
    .not('error_code', 'is', null)
    .gte('created_at', fromDate)
    .lte('created_at', toDate)
    .order('created_at')

  // Latency data
  const { data: latencyData } = await supabase
    .from('events')
    .select('latency_ms, created_at')
    .not('latency_ms', 'is', null)
    .gte('created_at', fromDate)
    .lte('created_at', toDate)
    .order('created_at')

  // Group by day
  const groupByDay = (events: any[]) => {
    const grouped: Record<string, number> = {}
    events?.forEach(event => {
      const date = new Date(event.created_at).toISOString().split('T')[0]
      grouped[date] = (grouped[date] || 0) + 1
    })
    return grouped
  }

  return {
    daily_recommendations: groupByDay(dailyRecommendations),
    daily_clicks: groupByDay(dailyClicks),
    daily_errors: groupByDay(dailyErrors),
    latency_series: latencyData?.map((d: any) => ({
      date: new Date(d.created_at).toISOString().split('T')[0],
      latency: d.latency_ms
    })) || []
  }
}

async function exportStatsCSV(supabase: any, query: StatsQuery) {
  const fromDate = query.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const toDate = query.to || new Date().toISOString()

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .gte('created_at', fromDate)
    .lte('created_at', toDate)
    .order('created_at')

  if (!events || events.length === 0) {
    return 'date,event_type,user_id,topic,time_bucket,error_code,latency_ms\n'
  }

  const csvHeader = 'date,event_type,user_id,topic,time_bucket,error_code,latency_ms\n'
  const csvRows = events.map((event: any) => {
    const date = new Date(event.created_at).toISOString().split('T')[0]
    const topic = event.event_data?.topic || ''
    const timeBucket = event.event_data?.time_bucket || ''
    
    return [
      date,
      event.event_type,
      event.user_id || '',
      topic,
      timeBucket,
      event.error_code || '',
      event.latency_ms || ''
    ].join(',')
  }).join('\n')

  return csvHeader + csvRows
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify admin authorization
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const query: StatsQuery = {
      from: url.searchParams.get('from') || undefined,
      to: url.searchParams.get('to') || undefined,
      topic: url.searchParams.get('topic') || undefined,
      time_bucket: url.searchParams.get('time_bucket') ? parseInt(url.searchParams.get('time_bucket')!) : undefined,
      locale: url.searchParams.get('locale') || undefined,
      platform: url.searchParams.get('platform') || undefined,
      export: url.searchParams.get('export') === 'true'
    }

    // Log admin action
    await supabase.rpc('log_admin_action', {
      p_action: query.export ? 'export_stats' : 'view_stats',
      p_resource: 'analytics_dashboard',
      p_details: query
    })

    if (query.export) {
      const csvData = await exportStatsCSV(supabase, query)
      const filename = `orayta-stats-${new Date().toISOString().split('T')[0]}.csv`
      
      return new Response(csvData, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      })
    }

    const [kpis, timeSeries] = await Promise.all([
      calculateKPIs(supabase, query),
      getTimeSeries(supabase, query)
    ])

    const response = {
      kpis,
      series: timeSeries,
      filters: query
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Stats API error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})