import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useProgress() {
  const { session } = useAuth()
  const [progress, setProgress] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchProgress = useCallback(async () => {
    if (!session) return
    const { data } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', session.user.id)
    setProgress(data || [])
    setLoading(false)
  }, [session])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  async function markComplete(moduleId, sectionKey = null) {
    if (!session) return
    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: session.user.id,
        module_id: moduleId,
        section_key: sectionKey,
      }, { onConflict: 'user_id,module_id,section_key' })
    if (!error) fetchProgress()
    return { error }
  }

  async function removeProgress(moduleId, sectionKey = null) {
    if (!session) return
    let query = supabase
      .from('user_progress')
      .delete()
      .eq('user_id', session.user.id)
      .eq('module_id', moduleId)
    if (sectionKey) query = query.eq('section_key', sectionKey)
    const { error } = await query
    if (!error) fetchProgress()
    return { error }
  }

  function getModuleProgress(moduleId) {
    return progress.filter(p => p.module_id === moduleId)
  }

  function isComplete(moduleId, sectionKey = null) {
    return progress.some(
      p => p.module_id === moduleId && p.section_key === sectionKey
    )
  }

  return { progress, loading, markComplete, removeProgress, getModuleProgress, isComplete }
}
