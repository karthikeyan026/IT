import { supabase } from '../lib/supabaseClient'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Subscribe to leaderboard updates in real-time
 */
export const subscribeToLeaderboard = (
  onUpdate: (payload: any) => void,
  onError?: (error: any) => void
): RealtimeChannel => {
  const channel = supabase
    .channel('public:leaderboard')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'students'
      },
      (payload) => {
        // When a student's score is updated, fetch fresh leaderboard
        onUpdate(payload)
      }
    )
    .subscribe((status) => {
      if (status === 'CLOSED') {
        console.log('Leaderboard subscription closed')
      }
      if (status === 'CHANNEL_ERROR') {
        onError?.(new Error('Channel error'))
      }
    })

  return channel
}

/**
 * Subscribe to event status changes (round transitions)
 */
export const subscribeToEventStatus = (
  onUpdate: (payload: any) => void,
  onError?: (error: any) => void
): RealtimeChannel => {
  const channel = supabase
    .channel('public:event_status')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'event_status'
      },
      (payload) => {
        onUpdate(payload.new)
      }
    )
    .subscribe((status) => {
      if (status === 'CLOSED') {
        console.log('Event status subscription closed')
      }
      if (status === 'CHANNEL_ERROR') {
        onError?.(new Error('Channel error'))
      }
    })

  return channel
}

/**
 * Subscribe to student activity changes
 */
export const subscribeToStudentActivity = (
  onUpdate: (payload: any) => void,
  onError?: (error: any) => void
): RealtimeChannel => {
  const channel = supabase
    .channel('public:student_activity')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'student_activity'
      },
      (payload) => {
        onUpdate(payload)
      }
    )
    .subscribe((status) => {
      if (status === 'CLOSED') {
        console.log('Student activity subscription closed')
      }
      if (status === 'CHANNEL_ERROR') {
        onError?.(new Error('Channel error'))
      }
    })

  return channel
}

/**
 * Subscribe to violations
 */
export const subscribeToViolations = (
  onUpdate: (payload: any) => void,
  onError?: (error: any) => void
): RealtimeChannel => {
  const channel = supabase
    .channel('public:violations')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'violations'
      },
      (payload) => {
        onUpdate(payload.new)
      }
    )
    .subscribe((status) => {
      if (status === 'CLOSED') {
        console.log('Violations subscription closed')
      }
      if (status === 'CHANNEL_ERROR') {
        onError?.(new Error('Channel error'))
      }
    })

  return channel
}

/**
 * Subscribe to plagiarism logs
 */
export const subscribeToPlagiarismLogs = (
  onUpdate: (payload: any) => void,
  onError?: (error: any) => void
): RealtimeChannel => {
  const channel = supabase
    .channel('public:plagiarism_logs')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'plagiarism_logs'
      },
      (payload) => {
        onUpdate(payload.new)
      }
    )
    .subscribe((status) => {
      if (status === 'CLOSED') {
        console.log('Plagiarism subscription closed')
      }
      if (status === 'CHANNEL_ERROR') {
        onError?.(new Error('Channel error'))
      }
    })

  return channel
}

/**
 * Unsubscribe from a channel
 */
export const unsubscribeFromChannel = async (channel: RealtimeChannel) => {
  await supabase.removeChannel(channel)
}

/**
 * Get current event status
 */
export const getEventStatus = async (): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('event_status')
      .select('*')
      .eq('id', 1)
      .single()

    if (error) {
      console.error('Error fetching event status:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}

/**
 * Update event status (admin only)
 */
export const updateEventStatus = async (currentRound: string, isLocked: boolean) => {
  try {
    const { error } = await supabase
      .from('event_status')
      .update({
        current_round: currentRound,
        is_locked: isLocked,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
