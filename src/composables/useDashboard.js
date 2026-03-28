import { ref, computed, onMounted, onUnmounted } from 'vue'
import { supabase } from '../lib/supabase'

export function useDashboard() {
  const agents = ref([])
  const tasks = ref([])
  const logs = ref([])
  const tokens = ref([])
  const isLoading = ref(true)
  const error = ref(null)
  const lastUpdated = ref(Date.now())
  const isConnected = ref(false)
  const useMockData = ref(false) // Toggle for mock data

  const stats = computed(() => ({
    activeAgents: agents.value?.filter(a => a?.is_active === true).length || 0,
    totalTasks: tasks.value?.length || 0,
    completedTasks: tasks.value?.filter(t => t?.status === 'completed').length || 0,
    pendingTasks: tasks.value?.filter(t => t?.status === 'pending').length || 0,
    inProgressTasks: tasks.value?.filter(t => t?.status === 'in-progress').length || 0,
    totalTokens: tokens.value?.reduce((sum, t) => sum + (t?.total_tokens || 0), 0) || 0,
    totalCost: tokens.value?.reduce((sum, t) => sum + (t?.total_cost || 0), 0) || 0
  }))

  // ============================================
  // MOCK DATA FUNCTIONS
  // ============================================

  const generateMockAgents = () => {
    return [
      { id: '1', name: 'dev-team', description: 'IT Department orchestrator', model: 'ollama/glm-5:cloud', skills: ['sessions_spawn', 'message'], is_active: true, created_at: new Date().toISOString() },
      { id: '2', name: 'analyst', description: 'Data analyst and requirements extractor', model: 'ollama/glm-5:cloud', skills: ['web_search', 'web_fetch'], is_active: true, created_at: new Date().toISOString() },
      { id: '3', name: 'designer', description: 'UI/UX designer', model: 'ollama/kimi-k2.5:cloud', skills: ['write', 'edit'], is_active: true, created_at: new Date().toISOString() },
      { id: '4', name: 'developer', description: 'Fullstack developer', model: 'ollama/minimax-m2.5:cloud', skills: ['write', 'edit', 'exec'], is_active: true, created_at: new Date().toISOString() },
      { id: '5', name: 'qa-engineer', description: 'Quality assurance specialist', model: 'ollama/glm-5:cloud', skills: ['test', 'validate'], is_active: false, created_at: new Date().toISOString() }
    ]
  }

  const generateMockTasks = () => {
    const now = new Date()
    return [
      // Pending tasks (with loading indicator)
      {
        id: '1',
        agent_id: '4',
        title: 'Create delicious-pastry website with TailwindCSS',
        description: 'Build a modern bakery website using TailwindCSS',
        status: 'pending',
        priority: 'high',
        metadata: { progress: 0, loading: true, estimated_completion: '2024-04-15T18:00:00Z' },
        created_at: new Date(now - 3600000).toISOString(),
        agents: { name: 'developer' }
      },
      {
        id: '2',
        agent_id: '2',
        title: 'Analyze user behavior data',
        description: 'Process user interaction data to identify patterns',
        status: 'pending',
        priority: 'normal',
        metadata: { progress: 0, loading: true, data_points: 25000 },
        created_at: new Date(now - 7200000).toISOString(),
        agents: { name: 'analyst' }
      },
      {
        id: '3',
        agent_id: '3',
        title: 'Create design system documentation',
        description: 'Document design system components and patterns',
        status: 'pending',
        priority: 'normal',
        metadata: { progress: 0, loading: true, components: 45 },
        created_at: new Date(now - 10800000).toISOString(),
        agents: { name: 'designer' }
      },
      // In-progress tasks
      {
        id: '4',
        agent_id: '4',
        title: 'Implement API endpoints for real-time data',
        description: 'Create RESTful API endpoints with WebSocket support',
        status: 'in-progress',
        priority: 'urgent',
        started_at: new Date(now - 10800000).toISOString(),
        metadata: { progress: 65, loading: false, endpoints_completed: 4, total_endpoints: 6 },
        created_at: new Date(now - 86400000).toISOString(),
        agents: { name: 'developer' }
      },
      {
        id: '5',
        agent_id: '2',
        title: 'Generate monthly report',
        description: 'Create comprehensive analytics report',
        status: 'in-progress',
        priority: 'high',
        started_at: new Date(now - 7200000).toISOString(),
        metadata: { progress: 45, loading: false, sections_completed: 3, total_sections: 7 },
        created_at: new Date(now - 172800000).toISOString(),
        agents: { name: 'analyst' }
      },
      {
        id: '6',
        agent_id: '3',
        title: 'Design dashboard UI components',
        description: 'Create modern dashboard components',
        status: 'in-progress',
        priority: 'normal',
        started_at: new Date(now - 18000000).toISOString(),
        metadata: { progress: 80, loading: false, components_completed: 8, total_components: 10 },
        created_at: new Date(now - 259200000).toISOString(),
        agents: { name: 'designer' }
      },
      // Completed tasks
      {
        id: '7',
        agent_id: '4',
        title: 'Setup GitHub repository structure',
        description: 'Initialize repository with CI/CD configuration',
        status: 'completed',
        priority: 'high',
        started_at: new Date(now - 172800000).toISOString(),
        completed_at: new Date(now - 86400000).toISOString(),
        metadata: { progress: 100, loading: false, completed: true, commits: 15 },
        created_at: new Date(now - 259200000).toISOString(),
        agents: { name: 'developer' }
      },
      {
        id: '8',
        agent_id: '2',
        title: 'Initial data gathering',
        description: 'Collect and organize initial dataset',
        status: 'completed',
        priority: 'normal',
        started_at: new Date(now - 259200000).toISOString(),
        completed_at: new Date(now - 172800000).toISOString(),
        metadata: { progress: 100, loading: false, completed: true, records: 15000 },
        created_at: new Date(now - 345600000).toISOString(),
        agents: { name: 'analyst' }
      }
    ]
  }

  const generateMockLogs = () => {
    const now = new Date()
    return [
      { id: '1', agent_id: '4', task_id: '1', action: 'TASK_CREATED', entity_type: 'task', details: { message: 'New development task created' }, status: 'success', created_at: new Date(now - 3600000).toISOString(), agents: { name: 'developer' }, tasks: { title: 'Create delicious-pastry website with TailwindCSS' } },
      { id: '2', agent_id: '4', task_id: '1', action: 'GITHUB_REPO_CREATED', entity_type: 'repository', details: { message: 'GitHub repository initialized', repo_name: 'delicious-pastry' }, status: 'success', created_at: new Date(now - 3500000).toISOString(), agents: { name: 'developer' }, tasks: { title: 'Create delicious-pastry website with TailwindCSS' } },
      { id: '3', agent_id: '4', task_id: '1', action: 'GIT_COMMIT', entity_type: 'code', details: { message: 'Initial commit with TailwindCSS setup' }, status: 'success', created_at: new Date(now - 3400000).toISOString(), agents: { name: 'developer' }, tasks: { title: 'Create delicious-pastry website with TailwindCSS' } },
      { id: '4', agent_id: '4', task_id: '4', action: 'API_ENDPOINT_CREATED', entity_type: 'api', details: { message: 'Created /api/realtime endpoint' }, status: 'success', created_at: new Date(now - 3000000).toISOString(), agents: { name: 'developer' }, tasks: { title: 'Implement API endpoints for real-time data' } },
      { id: '5', agent_id: '2', task_id: '5', action: 'DATA_ANALYSIS_STARTED', entity_type: 'analysis', details: { message: 'Starting data analysis pipeline' }, status: 'success', created_at: new Date(now - 2500000).toISOString(), agents: { name: 'analyst' }, tasks: { title: 'Generate monthly report' } },
      { id: '6', agent_id: '3', task_id: '6', action: 'COMPONENT_CREATED', entity_type: 'design', details: { message: 'Created Chart component' }, status: 'running', created_at: new Date(now - 2000000).toISOString(), agents: { name: 'designer' }, tasks: { title: 'Design dashboard UI components' } },
      { id: '7', agent_id: '1', task_id: null, action: 'WEBSOCKET_CONNECTED', entity_type: 'network', details: { message: 'WebSocket connection established' }, status: 'pending', created_at: new Date(now - 1000000).toISOString(), agents: { name: 'dev-team' }, tasks: null },
      { id: '8', agent_id: '5', task_id: null, action: 'TEST_FAILED', entity_type: 'testing', details: { message: 'Authentication test failed', error: 'Invalid credentials' }, status: 'error', created_at: new Date(now - 500000).toISOString(), agents: { name: 'qa-engineer' }, tasks: null }
    ]
  }

  const generateMockTokens = () => {
    return [
      { id: '1', agent_id: '4', agents: { name: 'developer' }, model: 'ollama/minimax-m2.5:cloud', input_tokens: 1250000, output_tokens: 850000, total_tokens: 2100000, total_cost: 2.10, period_start: new Date(Date.now() - 7 * 86400000).toISOString() },
      { id: '2', agent_id: '2', agents: { name: 'analyst' }, model: 'ollama/glm-5:cloud', input_tokens: 980000, output_tokens: 620000, total_tokens: 1600000, total_cost: 1.60, period_start: new Date(Date.now() - 7 * 86400000).toISOString() },
      { id: '3', agent_id: '3', agents: { name: 'designer' }, model: 'ollama/kimi-k2.5:cloud', input_tokens: 750000, output_tokens: 480000, total_tokens: 1230000, total_cost: 1.23, period_start: new Date(Date.now() - 7 * 86400000).toISOString() }
    ]
  }

  // Load mock data
  const loadMockData = () => {
    agents.value = generateMockAgents()
    tasks.value = generateMockTasks()
    logs.value = generateMockLogs()
    tokens.value = generateMockTokens()
    lastUpdated.value = Date.now()
    isLoading.value = false
    isConnected.value = true
    console.log('📦 Mock data loaded')
  }

  // ============================================
  // REAL SUPABASE FETCH FUNCTIONS
  // ============================================

  const fetchAgents = async () => {
    if (useMockData.value) return
    try {
      const { data, error: err } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw err
      agents.value = data || []
    } catch (err) {
      console.error('Error fetching agents:', err)
      error.value = err.message
      // Fallback to mock data on error
      useMockData.value = true
      loadMockData()
    }
  }

  const fetchTasks = async () => {
    if (useMockData.value) return
    try {
      const { data, error: err } = await supabase
        .from('tasks')
        .select('*, agents(name)')
        .order('created_at', { ascending: false })
        .limit(50)

      if (err) throw err
      tasks.value = data || []
    } catch (err) {
      console.error('Error fetching tasks:', err)
      error.value = err.message
      useMockData.value = true
      loadMockData()
    }
  }

  const fetchLogs = async () => {
    if (useMockData.value) return
    try {
      const { data, error: err } = await supabase
        .from('activity_logs')
        .select('*, agents(name), tasks(title)')
        .order('created_at', { ascending: false })
        .limit(100)

      if (err) throw err
      logs.value = data || []
    } catch (err) {
      console.error('Error fetching logs:', err)
      error.value = err.message
      useMockData.value = true
      loadMockData()
    }
  }

  const fetchTokens = async () => {
    if (useMockData.value) return
    try {
      const { data, error: err } = await supabase
        .from('model_tokens')
        .select('*, agents(name)')
        .order('created_at', { ascending: false })
        .limit(50)

      if (err) throw err
      tokens.value = data || []
    } catch (err) {
      console.error('Error fetching tokens:', err)
      error.value = err.message
      useMockData.value = true
      loadMockData()
    }
  }

  const refreshData = async () => {
    isLoading.value = true
    if (useMockData.value) {
      loadMockData()
    } else {
      await Promise.all([
        fetchAgents(),
        fetchTasks(),
        fetchLogs(),
        fetchTokens()
      ])
    }
    lastUpdated.value = Date.now()
    isLoading.value = false
  }

  // Simulate real-time updates for mock data
  let mockInterval = null

  const startMockRealtime = () => {
    if (!useMockData.value) return

    mockInterval = setInterval(() => {
      // Add a new mock log every 10 seconds
      const newLog = {
        id: Date.now().toString(),
        agent_id: '4',
        task_id: '4',
        action: 'PROGRESS_UPDATE',
        entity_type: 'task',
        details: { message: `Progress updated to ${Math.floor(Math.random() * 30) + 60}%` },
        status: 'success',
        created_at: new Date().toISOString(),
        agents: { name: 'developer' },
        tasks: { title: 'Implement API endpoints for real-time data' }
      }
      logs.value = [newLog, ...logs.value]
      if (logs.value.length > 100) logs.value.pop()

      // Update a random in-progress task's progress
      const inProgressTasks = tasks.value.filter(t => t.status === 'in-progress')
      if (inProgressTasks.length > 0) {
        const randomTask = inProgressTasks[Math.floor(Math.random() * inProgressTasks.length)]
        const currentProgress = randomTask.metadata?.progress || 0
        if (currentProgress < 100) {
          randomTask.metadata = {
            ...randomTask.metadata,
            progress: Math.min(currentProgress + Math.floor(Math.random() * 10) + 5, 100)
          }
          if (randomTask.metadata.progress >= 100) {
            randomTask.status = 'completed'
            randomTask.completed_at = new Date().toISOString()
            randomTask.metadata.loading = false
            randomTask.metadata.completed = true
          }
        }
      }

      lastUpdated.value = Date.now()
    }, 10000)
  }

  // WebSocket subscriptions (only for real data)
  let subscriptions = []

  const setupRealtime = () => {
    if (useMockData.value) {
      startMockRealtime()
      return
    }

    const tables = ['agents', 'tasks', 'activity_logs', 'model_tokens']

    tables.forEach(table => {
      const sub = supabase
        .channel(`${table}_changes`)
        .on('postgres_changes',
          { event: '*', schema: 'public', table },
          () => refreshData()
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            isConnected.value = true
          }
        })

      subscriptions.push(sub)
    })
  }

  const cleanup = () => {
    if (mockInterval) clearInterval(mockInterval)
    subscriptions.forEach(sub => supabase.removeChannel(sub))
    subscriptions = []
    isConnected.value = false
  }

  onMounted(() => {
    refreshData()
    setupRealtime()
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    agents,
    tasks,
    logs,
    tokens,
    isLoading,
    error,
    lastUpdated,
    isConnected,
    stats,
    refreshData,
    useMockData // Expose this to toggle mock data in UI
  }
}