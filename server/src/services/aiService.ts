import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export const aiService = {
    async evaluateAnswer(question: string, studentAnswer: string, correctAnswer: string): Promise<{
        isCorrect: boolean,
        feedback: string
    }> {
        const prompt = `
        You are an AI evaluator for a technical competition.
        
        Question: ${question}
        Correct Answer: ${correctAnswer}
        Student's Answer: ${studentAnswer}
        
        Evaluate if the student's answer is correct or semantically equivalent to the correct answer.
        Be lenient with formatting, whitespace, and minor variations.
        
        Respond ONLY with a JSON object:
        {
           "isCorrect": true or false,
           "feedback": "Brief explanation (1-2 sentences)"
        }
        `;

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [{ role: "system", content: prompt }]
            });

            const result = JSON.parse(response.choices[0].message.content || '{"isCorrect": false, "feedback": "Evaluation failed"}');
            return result;
        } catch (error) {
            console.error('AI evaluation error:', error);
            return {
                isCorrect: false,
                feedback: 'AI evaluation service unavailable'
            };
        }
    },

    async evaluateCode(question: string, submission: string, testCases: any[]): Promise<{
        score: number,
        feedback: string
    }> {
        const prompt = `
        You are an expert AI evaluator for a technical coding contest.
        Question: ${question}
        User's Submission Code:
        ${submission}

        Test Cases: ${JSON.stringify(testCases)}

        Evaluate the user's code. Determine if it is logically correct and would pass the test cases.
        Ignore minor whitespace and variable naming differences.
        Assign a score from 0-20 based on correctness and code quality.
        
        Respond ONLY with a JSON object:
        {
           "score": 15,
           "feedback": "Code is mostly correct but could be optimized. (2-3 sentences)"
        }
        `;

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [{ role: "system", content: prompt }]
            });

            const result = JSON.parse(response.choices[0].message.content || '{"score": 0, "feedback": "Evaluation failed"}');
            return result;
        } catch (error) {
            console.error('AI code evaluation error:', error);
            return {
                score: 0,
                feedback: 'AI evaluation service unavailable'
            };
        }
    }
};
