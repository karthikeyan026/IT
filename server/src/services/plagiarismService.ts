import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Helper function to calculate Cosine Similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Strip formatting and normalize basic variable names
function normalizeCode(code: string): string {
    return code.replace(/\s+/g, ' ').trim().toLowerCase();
}

export const plagiarismService = {
    async checkPlagiarism(newSubmissionCode: string, existingSubmissions: string[]): Promise<{
        isPlagiarism: boolean,
        maxSimilarity: number,
        flaggedSubmissionIndex: number
    }> {
        // Generating embeddings for new submission
        const newEmbedResponse = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: normalizeCode(newSubmissionCode),
        });
        const newEmbed = newEmbedResponse.data[0].embedding;

        let maxSimilarity = 0;
        let flaggedSubmissionIndex = -1;

        // Compare against existing submissions
        for (let i = 0; i < existingSubmissions.length; i++) {
            const existingEmbedResponse = await openai.embeddings.create({
                model: "text-embedding-ada-002",
                input: normalizeCode(existingSubmissions[i]),
            });
            const existingEmbed = existingEmbedResponse.data[0].embedding;

            const similarity = cosineSimilarity(newEmbed, existingEmbed);
            if (similarity > maxSimilarity) {
                maxSimilarity = similarity;
                flaggedSubmissionIndex = i;
            }
        }

        // if similarity > 85%, flag it
        return {
            isPlagiarism: maxSimilarity > 0.85,
            maxSimilarity: maxSimilarity,
            flaggedSubmissionIndex: maxSimilarity > 0.85 ? flaggedSubmissionIndex : -1
        };
    }
};
