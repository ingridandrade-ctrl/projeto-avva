import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useFavorites() {
  const { session } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchFavorites = useCallback(async () => {
    if (!session) return
    const { data } = await supabase
      .from('user_favorites')
      .select('*, ads(*)')
      .eq('user_id', session.user.id)
    setFavorites(data || [])
    setLoading(false)
  }, [session])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  async function toggleFavorite(adId) {
    if (!session) return
    const existing = favorites.find(f => f.ad_id === adId)
    if (existing) {
      await supabase.from('user_favorites').delete().eq('id', existing.id)
    } else {
      await supabase.from('user_favorites').insert({
        user_id: session.user.id,
        ad_id: adId,
      })
    }
    fetchFavorites()
  }

  function isFavorite(adId) {
    return favorites.some(f => f.ad_id === adId)
  }

  return { favorites, loading, toggleFavorite, isFavorite }
}
