import { ref, computed, onMounted, onUnmounted } from 'vue'
import { supabase } from '../lib/supabase'

export function useDashboard() {
  const agents = ref([])
  const subagents = ref([])
  const tasks = ref([])
  const tokens = ref([])
  const logs = ref([])
  const isLoading = ref(false)
  const lastUpdated = ref(Date.now())
  const error = ref(null)
  const isConnected = ref(false)

  const stats = computed(() => ({
    activeAgents: agents.value?.filter(a => a?.is_active === true).length || 0,
    totalTasks: tasks.value?.length || 0,
    completedTasks: tasks.value?.filter(t => t?.status === 'completed').length || 0,
    pendingTasks: tasks.value?.filter(t => t?.status === 'pending').length || 0,
    inProgressTasks: tasks.value?.filter(t => t?.status === 'in-progress').length || 0,
    totalTokens: tokens.value?.reduce((sum, t) => sum + (t?.total_tokens || 0), 0) || 0,
    totalCost: tokens.value?.reduce((sum, t) => sum + (t?.total_cost || 0), 0) || 0
  }))

  // Fetch functions
  const fetchAgents = async () => {
    try {
      const { data, error: err } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw err
      agents.value = data || []
      return { success: true, data }
    } catch (err) {
      console.error('Error fetching agents:', err)
      error.value = err.message
      agents.value = []
      return { success: false, error: err }
    }
  }

  const fetchSubagents = async () => {
    try {
      const { data, error: err } = await supabase
        .from('subagents')
        .select('*, agents(name)')
        .order('created_at', { ascending: false })

      if (err) throw err
      subagents.value = data || []
      return { success: true, data }
    } catch (err) {
      console.error('Error fetching subagents:', err)
      error.value = err.message
      subagents.value = []
      return { success: false, error: err }
    }
  }

  const fetchTasks = async () => {
    try {
      const { data, error: err } = await supabase
        .from('tasks')
        .select('*, agents(name), subagents(name)')
        .order('created_at', { ascending: false })
        .limit(100)

      if (err) throw err
      tasks.value = data || []
      return { success: true, data }
    } catch (err) {
      console.error('Error fetching tasks:', err)
      error.value = err.message
      tasks.value = []
      return { success: false, error: err }
    }
  }

  const fetchTokens = async () => {
    try {
      const { data, error: err } = await supabase
        .from('model_tokens')
        .select('*, agents(name)')
        .order('period_start', { ascending: false, nullsLast: true })
        .limit(50)

      if (err) throw err
      tokens.value = data || []
      return { success: true, data }
    } catch (err) {
      console.error('Error fetching tokens:', err)
      error.value = err.message
      tokens.value = []
      return { success: false, error: err }
    }
  }

  const fetchLogs = async () => {
    try {
      const { data, error: err } = await supabase
        .from('activity_logs')
        .select('*, agents(name), subagents(name), tasks(title)')
        .order('created_at', { ascending: false })
        .limit(100)

      if (err) throw err
      logs.value = data || []
      return { success: true, data }
    } catch (err) {
      console.error('Error fetching logs:', err)
      error.value = err.message
      logs.value = []
      return { success: false, error: err }
    }
  }

  const refreshData = async () => {
    isLoading.value = true
    error.value = null

    try {
      await Promise.all([
        fetchAgents(),
        fetchSubagents(),
        fetchTasks(),
        fetchTokens(),
        fetchLogs()
      ])
      lastUpdated.value = Date.now()
      return { success: true }
    } catch (err) {
      error.value = err.message
      console.error('Error refreshing data:', err)
      return { success: false, error: err }
    } finally {
      isLoading.value = false
    }
  }

  // Real-time update handlers
  const handleRealtimeUpdate = (table, payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload

    switch (table) {
      case 'agents':
        handleAgentUpdate(eventType, newRecord, oldRecord)
        break
      case 'subagents':
        handleSubagentUpdate(eventType, newRecord, oldRecord)
        break
      case 'tasks':
        handleTaskUpdate(eventType, newRecord, oldRecord)
        break
      case 'model_tokens':
        handleTokenUpdate(eventType, newRecord, oldRecord)
        break
      case 'activity_logs':
        handleLogUpdate(eventType, newRecord, oldRecord)
        break
    }

    lastUpdated.value = Date.now()
  }

  const handleAgentUpdate = (eventType, newRecord, oldRecord) => {
    switch (eventType) {
      case 'INSERT':
        agents.value = [newRecord, ...agents.value]
        console.log(`🟢 New agent: ${newRecord.name}`)
        break
      case 'UPDATE':
        const index = agents.value.findIndex(a => a.id === newRecord.id)
        if (index !== -1) {
          agents.value[index] = newRecord
          console.log(`🔄 Agent updated: ${newRecord.name}`)
        }
        break
      case 'DELETE':
        agents.value = agents.value.filter(a => a.id !== oldRecord.id)
        console.log(`🔴 Agent removed: ${oldRecord.name}`)
        break
    }
  }

  const handleSubagentUpdate = (eventType, newRecord, oldRecord) => {
    switch (eventType) {
      case 'INSERT':
        subagents.value = [newRecord, ...subagents.value]
        console.log(`🟢 New subagent: ${newRecord.name}`)
        break
      case 'UPDATE':
        const index = subagents.value.findIndex(s => s.id === newRecord.id)
        if (index !== -1) {
          subagents.value[index] = newRecord
          console.log(`🔄 Subagent updated: ${newRecord.name}`)
        }
        break
      case 'DELETE':
        subagents.value = subagents.value.filter(s => s.id !== oldRecord.id)
        console.log(`🔴 Subagent removed: ${oldRecord.name}`)
        break
    }
  }

  const handleTaskUpdate = (eventType, newRecord, oldRecord) => {
    switch (eventType) {
      case 'INSERT':
        tasks.value = [newRecord, ...tasks.value]
        console.log(`🟢 New task: ${newRecord.title} (${newRecord.status})`)
        break
      case 'UPDATE':
        const index = tasks.value.findIndex(t => t.id === newRecord.id)
        if (index !== -1) {
          tasks.value[index] = newRecord
          console.log(`🔄 Task updated: ${newRecord.title} → ${newRecord.status}`)
        }
        break
      case 'DELETE':
        tasks.value = tasks.value.filter(t => t.id !== oldRecord.id)
        console.log(`🔴 Task removed: ${oldRecord.title}`)
        break
    }
  }

  const handleTokenUpdate = (eventType, newRecord, oldRecord) => {
    switch (eventType) {
      case 'INSERT':
        tokens.value = [newRecord, ...tokens.value]
        break
      case 'UPDATE':
        const index = tokens.value.findIndex(t => t.id === newRecord.id)
        if (index !== -1) tokens.value[index] = newRecord
        break
      case 'DELETE':
        tokens.value = tokens.value.filter(t => t.id !== oldRecord.id)
        break
    }
  }

  const handleLogUpdate = (eventType, newRecord, oldRecord) => {
    switch (eventType) {
      case 'INSERT':
        logs.value = [newRecord, ...logs.value]
        if (logs.value.length > 100) logs.value.pop()
        console.log(`📝 New activity: ${newRecord.action}`)
        break
      case 'UPDATE':
        const index = logs.value.findIndex(l => l.id === newRecord.id)
        if (index !== -1) logs.value[index] = newRecord
        break
      case 'DELETE':
        logs.value = logs.value.filter(l => l.id !== oldRecord.id)
        break
    }
  }

  // WebSocket subscriptions
  let subscriptions = []

  const setupRealtimeSubscriptions = () => {
    const tables = ['agents', 'subagents', 'tasks', 'model_tokens', 'activity_logs']

    tables.forEach(table => {
      const subscription = supabase
        .channel(`${table}_changes`)
        .on('postgres_changes',
          { event: '*', schema: 'public', table },
          (payload) => {
            handleRealtimeUpdate(table, payload)
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`🔌 WebSocket connected: ${table}`)
            isConnected.value = true
          } else if (status === 'CHANNEL_ERROR') {
            console.error(`❌ WebSocket error: ${table}`)
            isConnected.value = false
          }
        })

      subscriptions.push(subscription)
    })
  }

  const cleanupSubscriptions = () => {
    subscriptions.forEach(sub => {
      supabase.removeChannel(sub)
    })
    subscriptions = []
    isConnected.value = false
    console.log('🔌 WebSocket disconnected')
  }

  onMounted(() => {
    console.log('🎮 Mission Control initialized')
    refreshData().then(() => {
      console.log('✅ Initial data loaded')
    })
    setupRealtimeSubscriptions()
  })

  onUnmounted(() => {
    cleanupSubscriptions()
  })

  return {
    agents,
    subagents,
    tasks,
    tokens,
    logs,
    isLoading,
    lastUpdated,
    error,
    stats,
    isConnected,
    refreshData
  }
}