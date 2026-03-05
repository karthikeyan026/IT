import { supabase } from '../lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'
import { getQuestionSubmissions } from './supabaseQuestions'

/**
 * Simple similarity check using Levenshtein distance
 */
const calculateSimilarity = (str1: string, str2: string): number => {
  const len1 = str1.length
  const len2 = str2.length
  const matrix: number[][] = Array(len2 + 1)
    .fill(null)
    .map(() => Array(len1 + 1).fill(0))

  for (let i = 0; i <= len1; i++) matrix[0][i] = i
  for (let j = 0; j <= len2; j++) matrix[j][0] = j

  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const indicator = str1.charAt(i - 1) === str2.charAt(j - 1) ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      )
    }
  }

  const distance = matrix[len2][len1]
  const maxLen = Math.max(len1, len2)
  return ((maxLen - distance) / maxLen) * 100
}

/**
 * Check plagiarism for a submission
 * Compares with other students' answers for the same question
 */
export const checkPlagiarism = async (
  studentId: string,
  questionId: string,
  answer: string
): Promise<{ suspicious: boolean; matches: any[] }> => {
  try {
    // Get all submissions for this question
    const otherSubmissions = await getQuestionSubmissions(questionId)
    const matches: any[] = []

    for (const submission of otherSubmissions) {
      // Skip own submission
      if (submission.student_id === studentId) continue

      // Calculate similarity
      const similarity = calculateSimilarity(answer, submission.answer || '')

      // If similarity > 85%, it's suspicious
      if (similarity > 85) {
        matches.push({
          otherStudentId: submission.student_id,
          similarity: Math.round(similarity),
          otherAnswer: submission.answer
        })

        // Log plagiarism
        await logPlagiarism(studentId, submission.student_id, questionId, similarity)
      }
    }

    return {
      suspicious: matches.length > 0,
      matches
    }
  } catch (error) {
    console.error('Error checking plagiarism:', error)
    return {
      suspicious: false,
      matches: []
    }
  }
}

/**
 * Log plagiarism
 */
export const logPlagiarism = async (
  student1Id: string,
  student2Id: string,
  questionId: string,
  similarityScore: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('plagiarism_logs')
      .insert([
        {
          id: uuidv4(),
          student1_id: student1Id,
          student2_id: student2Id,
          question_id: questionId,
          similarity_score: Math.round(similarityScore * 100) / 100,
          action_taken: false,
          created_at: new Date().toISOString()
        }
      ])

    if (error) {
      console.error('Error logging plagiarism:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Get plagiarism logs
 */
export const getPlagiarismLogs = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('plagiarism_logs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching plagiarism logs:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error:', error)
    return []
  }
}

/**
 * Get plagiarism logs for a student
 */
export const getStudentPlagiarismLogs = async (studentId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('plagiarism_logs')
      .select('*')
      .or(`student1_id.eq.${studentId},student2_id.eq.${studentId}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching plagiarism logs:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error:', error)
    return []
  }
}
