import { supabase } from '../lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'

export interface Student {
  id: string
  reg_no: string
  name: string
  role: 'STUDENT' | 'ADMIN'
  login_time: string
  is_online: boolean
  technical_score: number
  aptitude_score: number
  overall_score: number
  total_time: number
  created_at: string
}

/**
 * Login a student using name and register number
 * Creates a new student if doesn't exist
 */
export const loginStudent = async (name: string, regNo: string): Promise<{ success: boolean; student?: Student; error?: string }> => {
  try {
    // First, check if student exists
    const { data: existingStudent, error: fetchError } = await supabase
      .from('students')
      .select('*')
      .eq('reg_no', regNo.toUpperCase())
      .single()

    if (existingStudent) {
      // Update login time and online status
      await supabase
        .from('students')
        .update({ login_time: new Date().toISOString(), is_online: true })
        .eq('id', existingStudent.id)

      return { success: true, student: existingStudent }
    }

    // If not found and no error (404), create new student
    if (fetchError?.code === 'PGRST116') {
      // Generate UUID for new student
      const newStudentId = uuidv4()
      
      const { data: newStudent, error: insertError } = await supabase
        .from('students')
        .insert([
          {
            id: newStudentId,
            reg_no: regNo.toUpperCase(),
            name: name.trim(),
            role: 'STUDENT',
            login_time: new Date().toISOString(),
            is_online: true,
            technical_score: 0,
            aptitude_score: 0,
            overall_score: 0,
            total_time: 0
          }
        ])
        .select()
        .single()

      if (insertError) {
        return { success: false, error: insertError.message }
      }

      return { success: true, student: newStudent }
    }

    // Other errors
    return { success: false, error: fetchError?.message || 'Login failed' }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Get current student data
 */
export const getStudentProfile = async (studentId: string): Promise<Student | null> => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single()

    if (error) {
      console.error('Error fetching student:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}

/**
 * Update student online status
 */
export const updateStudentOnlineStatus = async (studentId: string, isOnline: boolean) => {
  try {
    await supabase
      .from('students')
      .update({ is_online: isOnline })
      .eq('id', studentId)
  } catch (error) {
    console.error('Error updating online status:', error)
  }
}

/**
 * Logout student
 */
export const logoutStudent = async (studentId: string) => {
  try {
    await updateStudentOnlineStatus(studentId, false)
    localStorage.removeItem('student')
    localStorage.removeItem('token')
  } catch (error) {
    console.error('Error logging out:', error)
  }
}

/**
 * Check if student is admin
 */
export const isAdmin = (student: Student): boolean => {
  return student?.role === 'ADMIN'
}
