import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export const atsService = {
    async analyzeResume(resumeText: string): Promise<{
        atsScore: number,
        skillScore: number,
        experienceScore: number,
        keywordScore: number,
        aiAnalysisReport: string,
        strengthWeaknessList: string
    }> {
        const prompt = `
        You are a senior ATS Resume Analyzer AI.
        Here is the parsed text from a student's resume:
        ---
        ${resumeText}
        ---
        Analyze the skills relevance (Java, Python, Web, DBMS), project quality, internship experience,
        technical keyword density, formatting ATS friendliness, action verbs, and clarity.
        
        Provide scores from 0-100 for each category.
        
        Respond ONLY with a JSON object exactly like this:
        {
            "atsScore": 85,
            "skillScore": 90,
            "experienceScore": 75,
            "keywordScore": 88,
            "aiAnalysisReport": "Strong technical skills but lacks internship experience.",
            "strengthWeaknessList": "Strengths: Web Dev, Java. Weaknesses: Action verbs."
        }
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "system", content: prompt }]
        });

        const result = JSON.parse(response.choices[0].message.content || '{}');
        return result;
    }
};
