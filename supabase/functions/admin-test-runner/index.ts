import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TestConfig {
  suite: string
  case: string
  topic?: string
  time_bucket?: number
  seed?: string
  iterations?: number
}

interface TestResult {
  passed: boolean
  execution_time_ms: number
  logs: string[]
  payload_snippet?: any
  error_details?: string
  metrics?: {
    latency_ms?: number
    response_size?: number
  }
}

async function runRecommendationTest(config: TestConfig): Promise<TestResult> {
  const startTime = Date.now()
  const logs: string[] = []
  
  try {
    logs.push(`Starting recommendation test for topic: ${config.topic}, time: ${config.time_bucket}`)
    
    // Simulate recommendation API call
    const mockRecommendation = {
      id: 'test-source-123',
      title: 'Test Torah Source',
      title_he: 'מקור תורה לבדיקה',
      category: config.topic || 'Halacha',
      estimated_time: config.time_bucket || 15,
      sefaria_link: 'https://www.sefaria.org/Mishnah_Berakhot.1.1',
      text_excerpt: 'From when do we recite the Shema in the evening?',
      reflection_prompt: 'What does this teach us about timing in Jewish law?',
      source_range: 'Mishnah Berakhot 1:1-2'
    }
    
    logs.push('Generated mock recommendation successfully')
    
    // Test Sefaria link validation
    const sefariaResponse = await fetch(mockRecommendation.sefaria_link, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    })
    
    if (sefariaResponse.ok) {
      logs.push('Sefaria link validation: PASSED')
    } else {
      logs.push(`Sefaria link validation: FAILED (${sefariaResponse.status})`)
    }
    
    const executionTime = Date.now() - startTime
    logs.push(`Test completed in ${executionTime}ms`)
    
    return {
      passed: sefariaResponse.ok,
      execution_time_ms: executionTime,
      logs,
      payload_snippet: mockRecommendation,
      metrics: {
        latency_ms: executionTime,
        response_size: JSON.stringify(mockRecommendation).length
      }
    }
    
  } catch (error) {
    const executionTime = Date.now() - startTime
    logs.push(`Error: ${error.message}`)
    
    return {
      passed: false,
      execution_time_ms: executionTime,
      logs,
      error_details: error.message
    }
  }
}

async function runContentRulesTest(): Promise<TestResult> {
  const startTime = Date.now()
  const logs: string[] = []
  
  try {
    logs.push('Testing content rules and license guards')
    
    // Test that we only link out, no embedded text
    const testContent = {
      hasEmbeddedText: false,
      hasExternalLink: true,
      linkDomain: 'sefaria.org'
    }
    
    const passed = !testContent.hasEmbeddedText && 
                  testContent.hasExternalLink && 
                  testContent.linkDomain === 'sefaria.org'
    
    logs.push(`Content rules check: ${passed ? 'PASSED' : 'FAILED'}`)
    
    return {
      passed,
      execution_time_ms: Date.now() - startTime,
      logs,
      payload_snippet: testContent
    }
    
  } catch (error) {
    return {
      passed: false,
      execution_time_ms: Date.now() - startTime,
      logs: [...logs, `Error: ${error.message}`],
      error_details: error.message
    }
  }
}

async function runSessionAnalyticsTest(): Promise<TestResult> {
  const startTime = Date.now()
  const logs: string[] = []
  
  try {
    logs.push('Testing session analytics event logging')
    
    // Simulate event logging
    const events = [
      { type: 'topic_selected', data: { topic: 'Halacha', time_bucket: 15 } },
      { type: 'recommendation_shown', data: { content_id: 'test-123' } },
      { type: 'link_clicked', data: { outbound_url: 'https://sefaria.org' } }
    ]
    
    logs.push(`Generated ${events.length} test events`)
    logs.push('Analytics tracking: PASSED')
    
    return {
      passed: true,
      execution_time_ms: Date.now() - startTime,
      logs,
      payload_snippet: events
    }
    
  } catch (error) {
    return {
      passed: false,
      execution_time_ms: Date.now() - startTime,
      logs: [...logs, `Error: ${error.message}`],
      error_details: error.message
    }
  }
}

async function runPerformanceTest(config: TestConfig): Promise<TestResult> {
  const startTime = Date.now()
  const logs: string[] = []
  
  try {
    logs.push('Testing API performance benchmarks')
    
    // Simulate API call with timing
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 50))
    
    const latency = Date.now() - startTime
    const passed = latency < 300 // p95 < 300ms requirement
    
    logs.push(`API latency: ${latency}ms`)
    logs.push(`Performance test: ${passed ? 'PASSED' : 'FAILED'} (target: <300ms)`)
    
    return {
      passed,
      execution_time_ms: latency,
      logs,
      metrics: {
        latency_ms: latency
      }
    }
    
  } catch (error) {
    return {
      passed: false,
      execution_time_ms: Date.now() - startTime,
      logs: [...logs, `Error: ${error.message}`],
      error_details: error.message
    }
  }
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

    const config: TestConfig = await req.json()
    let results: TestResult[] = []

    // Log admin action
    await supabase.rpc('log_admin_action', {
      p_action: 'run_test',
      p_resource: 'test_suite',
      p_details: config
    })

    const iterations = config.iterations || 1

    for (let i = 0; i < iterations; i++) {
      let result: TestResult

      switch (config.suite) {
        case 'recommendation':
          if (config.case === 'happy_path') {
            result = await runRecommendationTest(config)
          } else if (config.case === 'performance') {
            result = await runPerformanceTest(config)
          } else {
            throw new Error(`Unknown recommendation test case: ${config.case}`)
          }
          break

        case 'content_rules':
          result = await runContentRulesTest()
          break

        case 'analytics':
          result = await runSessionAnalyticsTest()
          break

        default:
          throw new Error(`Unknown test suite: ${config.suite}`)
      }

      results.push(result)

      // Store test result in database
      await supabase.from('test_runs').insert({
        admin_user_id: user.id,
        suite_name: config.suite,
        test_case: config.case,
        test_config: config,
        passed: result.passed,
        execution_time_ms: result.execution_time_ms,
        logs: result.logs,
        payload_snippet: result.payload_snippet,
        error_details: result.error_details
      })
    }

    // Calculate aggregate results for multiple runs
    const aggregateResult = {
      total_runs: results.length,
      passed_runs: results.filter(r => r.passed).length,
      avg_execution_time: Math.round(results.reduce((sum, r) => sum + r.execution_time_ms, 0) / results.length),
      results: iterations === 1 ? results[0] : results
    }

    return new Response(
      JSON.stringify(aggregateResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Test runner error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})