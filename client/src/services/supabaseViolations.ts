import { supabase } from '../lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'

/**
 * Log a violation (tab switch, blur, etc.)
 */
export const logViolation = async (
  studentId: string,
  violationType: 'TAB_SWITCH' | 'BLUR' | 'MINIMIZE'
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('violations')
      .insert([
        {
          id: uuidv4(),
          student_id: studentId,
          violation_type: violationType,
          timestamp: new Date().toISOString()
        }
      ])

    if (error) {
      console.error('Error logging violation:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Get violations for a student
 */
export const getStudentViolations = async (studentId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('violations')
      .select('*')
      .eq('student_id', studentId)
      .order('timestamp', { ascending: false })

    if (error) {
      console.error('Error fetching violations:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error:', error)
    return []
  }
}

/**
 * Get all violations
 */
export const getAllViolations = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('violations')
      .select('*')
      .order('timestamp', { ascending: false })

    if (error) {
      console.error('Error fetching violations:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error:', error)
    return []
  }
}

/**
 * Get suspicious students (those with 3+ violations)
 */
export const getSuspiciousStudents = async (): Promise<any[]> => {
  try {
    const { data: violations, error: violError } = await supabase
      .from('violations')
      .select('student_id, count')
      .order('timestamp', { ascending: false })

    if (violError) {
      console.error('Error fetching violations:', violError)
      return []
    }

    // Count violations per student
    const violationCounts: { [key: string]: number } = {}
    for (const v of violations || []) {
      violationCounts[v.student_id] = (violationCounts[v.student_id] || 0) + 1
    }

    // Get students with 3+ violations
    const suspiciousStudentIds = Object.entries(violationCounts)
      .filter(([, count]) => count >= 3)
      .map(([id]) => id)

    if (suspiciousStudentIds.length === 0) {
      return []
    }

    const { data: students, error: studError } = await supabase
      .from('students')
      .select('*')
      .in('id', suspiciousStudentIds)

    if (studError) {
      console.error('Error fetching students:', studError)
      return []
    }

    return students || []
  } catch (error) {
    console.error('Error:', error)
    return []
  }
}
