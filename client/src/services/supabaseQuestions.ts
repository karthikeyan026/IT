import { supabase } from '../lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'

export interface Question {
  id: string
  round_name: 'TECHNICAL' | 'APTITUDE'
  type: string
  content: string
  options?: any
  correct_answer?: string
  test_cases?: any
  points: number
  time_limit: number
  order_index: number
  image_url?: string
  created_at: string
}

export interface Submission {
  id: string
  student_id: string
  question_id: string
  answer: string
  score: number
  time_taken: number
  status: 'PENDING' | 'EVALUATED' | 'FLAGGED'
  ai_feedback?: string
  created_at: string
}

/**
 * Get all questions for a specific round
 */
export const getRoundQuestions = async (roundName: 'TECHNICAL' | 'APTITUDE'): Promise<Question[]> => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('round_name', roundName)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching questions:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error:', error)
    return []
  }
}

/**
 * Get a single question
 */
export const getQuestion = async (questionId: string): Promise<Question | null> => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single()

    if (error) {
      console.error('Error fetching question:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}

/**
 * Submit an answer for a question
 */
export const submitAnswer = async (
  studentId: string,
  questionId: string,
  answer: string,
  timeTaken: number
): Promise<{ success: boolean; submission?: Submission; error?: string }> => {
  try {
    // Get the question to check correct answer
    const question = await getQuestion(questionId)
    if (!question) {
      return { success: false, error: 'Question not found' }
    }

    // Calculate score (simple match for MCQ, 0 for now for coding)
    let score = 0
    if (question.type === 'MCQ' && answer === question.correct_answer) {
      score = question.points
    }

    // Create submission
    const { data: submission, error: submitError } = await supabase
      .from('submissions')
      .insert([
        {
          id: uuidv4(),
          student_id: studentId,
          question_id: questionId,
          answer,
          score,
          time_taken: timeTaken,
          status: 'EVALUATED',
          ai_feedback: ''
        }
      ])
      .select()
      .single()

    if (submitError) {
      return { success: false, error: submitError.message }
    }

    // Update student score
    await updateStudentScore(studentId, score, question.round_name)

    return { success: true, submission }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Get all submissions for a student
 */
export const getStudentSubmissions = async (studentId: string): Promise<Submission[]> => {
  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching submissions:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error:', error)
    return []
  }
}

/**
 * Get all submissions for a question
 */
export const getQuestionSubmissions = async (questionId: string): Promise<Submission[]> => {
  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('question_id', questionId)

    if (error) {
      console.error('Error fetching submissions:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error:', error)
    return []
  }
}

/**
 * Update student score
 */
export const updateStudentScore = async (
  studentId: string,
  scoreToAdd: number,
  roundName: 'TECHNICAL' | 'APTITUDE'
) => {
  try {
    const { data: student, error: fetchError } = await supabase
      .from('students')
      .select('aptitude_score, technical_score, overall_score')
      .eq('id', studentId)
      .single()

    if (fetchError || !student) {
      console.error('Error fetching student:', fetchError)
      return
    }

    let newAptitudeScore = student.aptitude_score
    let newTechnicalScore = student.technical_score

    if (roundName === 'APTITUDE') {
      newAptitudeScore = (student.aptitude_score || 0) + scoreToAdd
    } else if (roundName === 'TECHNICAL') {
      newTechnicalScore = (student.technical_score || 0) + scoreToAdd
    }

    const newOverallScore = newAptitudeScore + newTechnicalScore

    await supabase
      .from('students')
      .update({
        aptitude_score: newAptitudeScore,
        technical_score: newTechnicalScore,
        overall_score: newOverallScore
      })
      .eq('id', studentId)
  } catch (error) {
    console.error('Error updating student score:', error)
  }
}

/**
 * Get leaderboard
 */
export const getLeaderboard = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')

    if (error) {
      console.error('Error fetching leaderboard:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error:', error)
    return []
  }
}

/**
 * Seed questions (for initial setup) - MCQ questions
 */
export const seedAptitudeQuestions = async (questions: Partial<Question>[]) => {
  try {
    const questionsWithIds = questions.map((q, idx) => ({
      id: uuidv4(),
      round_name: 'APTITUDE' as const,
      type: 'MCQ',
      order_index: idx,
      time_limit: 60,
      points: 5,
      ...q
    }))

    const { error } = await supabase
      .from('questions')
      .insert(questionsWithIds)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Seed technical questions
 */
export const seedTechnicalQuestions = async (questions: Partial<Question>[]) => {
  try {
    const questionsWithIds = questions.map((q, idx) => ({
      id: uuidv4(),
      round_name: 'TECHNICAL' as const,
      order_index: idx,
      ...q
    }))

    const { error } = await supabase
      .from('questions')
      .insert(questionsWithIds)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
