
import { GoogleGenAI, Type } from "@google/genai";
import type { ChatMessage, Candidate, SkillAssessmentQuestion } from './types.ts';

const AI_UNAVAILABLE_MESSAGE = "AI features are unavailable. The API key has not been configured for this deployment.";

let ai: GoogleGenAI | null;

// Initialize the GoogleGenAI instance.
// The coding guidelines require assuming that process.env.API_KEY is available.
// This try-catch block handles cases where the environment variable is not set,
// preventing the app from crashing and providing a clear warning.
try {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is not set.");
  }
  ai = new GoogleGenAI({ apiKey });
} catch (e) {
  console.warn(
    "AI features are disabled. Could not initialize GoogleGenAI. " +
    "This is expected if an API key is not configured for the deployment. " +
    `Error: ${e instanceof Error ? e.message : String(e)}`
  );
  ai = null;
}


export const generateJobDescription = async (
  title: string,
  keywords: string
): Promise<string> => {
  if (!ai) {
    return AI_UNAVAILABLE_MESSAGE;
  }

  const prompt = `
    Generate a professional and engaging job description for the following role.
    The tone should be encouraging and clear, aimed at attracting top talent.
    Structure it with the following sections: "About the Role", "Key Responsibilities", and "Qualifications".
    
    IMPORTANT: Do not use any Markdown formatting. For example, do not use asterisks for bold text or hashes for headings. The entire output should be plain text.
    
    Job Title: ${title}
    
    Key points to include: ${keywords}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating job description:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
        return "AI features are unavailable. The provided API key is invalid. Please check your deployment configuration.";
    }
    return "Error generating description. Please try again.";
  }
};


export const screenCandidate = async (
  jobDescription: string,
  candidateSummary: string
): Promise<string> => {
  if (!ai) {
    return AI_UNAVAILABLE_MESSAGE;
  }
  
  const prompt = `
    As an expert HR screener, analyze the following candidate's summary against the provided job description.
    Provide a concise, 2-3 sentence summary of the candidate's potential fit for the role. 
    Highlight key strengths and potential gaps. Do not make a hiring recommendation, only assess the profile.

    **Job Description:**
    ---
    ${jobDescription}
    ---

    **Candidate Summary:**
    ---
    ${candidateSummary}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error screening candidate:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
        return "AI features are unavailable. The provided API key is invalid. Please check your deployment configuration.";
    }
    return "Error performing AI screening. Please try again.";
  }
};

export const findMatchingCandidates = async (
  jobDescription: string,
  candidates: Candidate[]
): Promise<{ candidateId: string; justification: string; }[]> => {
  if (!ai) {
    throw new Error(AI_UNAVAILABLE_MESSAGE);
  }

  const systemInstruction = `You are an expert technical recruiter. Your task is to analyze a job description and a list of candidate profiles.
  Identify the top 5 best-fit candidates from the list. For each candidate you select, provide a concise 1-2 sentence justification explaining why they are a strong match for the role, referencing specific skills or experiences.
  Return the result as a JSON array of objects.`;

  const prompt = `
Job Description:
---
${jobDescription}
---

Candidate Profiles:
---
${candidates.map(c => `ID: ${c.id}\nName: ${c.name}\nSummary: ${c.summary}\nResume: ${c.resumeText}\n---`).join('\n')}
`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { 
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                candidateId: { type: Type.STRING },
                justification: { type: Type.STRING },
              },
              required: ['candidateId', 'justification'],
            },
        },
      },
    });
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error finding matching candidates:", error);
    return []; // Return empty array on error
  }
};


export const generateInterviewContinuation = async (
  transcript: ChatMessage[],
  jobDescription: string
): Promise<string> => {
  if (!ai) {
    return AI_UNAVAILABLE_MESSAGE;
  }

  const systemInstruction = `You are an expert interviewer conducting a practice interview for the following role. Your goal is to help the candidate prepare.
- If the transcript is empty, start the interview by asking one relevant opening question based on the job description. Do not say "Hello" or "Welcome". Just ask the first question directly.
- If the transcript is not empty, ask the next logical follow-up question based on the conversation so far.
- Keep the questions relevant to the job. Ask only one question. Do not add any conversational filler.`;

  const prompt = `
Job Description:
---
${jobDescription}
---

Interview Transcript:
---
${transcript.map(msg => `${msg.senderId === 'ai' ? 'Interviewer' : 'user'}: ${msg.text}`).join('\n')}
---
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { systemInstruction },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating interview question:", error);
    return "I'm sorry, I encountered an error. Please try ending the session and starting again.";
  }
};

export const getInterviewFeedback = async (
  transcript: ChatMessage[],
  jobDescription: string
): Promise<string> => {
  if (!ai) {
    return AI_UNAVAILABLE_MESSAGE;
  }

  const systemInstruction = `You are an expert career coach. The following is a transcript of a practice interview for a job.
Your task is to provide constructive, encouraging feedback based on the candidate's responses.
The output MUST be plain text. Do not use any markdown formatting (like **, #, or lists with - or *).
Structure your feedback into two distinct sections. Start the first section with the exact heading "What Went Well:". Start the second section with the exact heading "Areas for Improvement:".
Under each heading, provide a few bullet points of feedback.
Focus on the clarity, relevance, and depth of their answers in relation to the job description.
Provide specific examples from the transcript to support your points. The feedback should be helpful and actionable.`;

  const prompt = `
Job Description:
---
${jobDescription}
---

Interview Transcript:
---
${transcript.map(msg => `${msg.senderId === 'ai' ? 'Interviewer' : 'Candidate'}: ${msg.text}`).join('\n')}
---
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { systemInstruction },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating interview feedback:", error);
    return "I'm sorry, I encountered an error generating feedback for this session.";
  }
};

export const generateSkillAssessment = async (
    jobDescription: string
): Promise<SkillAssessmentQuestion[]> => {
    if (!ai) {
        throw new Error(AI_UNAVAILABLE_MESSAGE);
    }

    const systemInstruction = `You are an expert technical assessor. Your task is to create a 5-question multiple-choice quiz to evaluate a candidate's skills for a specific job.
    The questions should be relevant to the key responsibilities and qualifications mentioned in the job description.
    For each question, provide 4 options and clearly indicate the index of the correct answer (0-3).
    The output must be a valid JSON array of objects.`;

    const prompt = `
    Job Description:
    ---
    ${jobDescription}
    ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            options: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING },
                            },
                            correctAnswerIndex: { type: Type.INTEGER },
                        },
                        required: ['question', 'options', 'correctAnswerIndex'],
                    },
                },
            },
        });
        const jsonStr = response.text.trim();
        const questions = JSON.parse(jsonStr);
        // Basic validation
        if (!Array.isArray(questions) || questions.some(q => !q.question || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.correctAnswerIndex !== 'number')) {
            throw new Error("Generated assessment has an invalid format.");
        }
        return questions;
    } catch (error) {
        console.error("Error generating skill assessment:", error);
        if (error instanceof Error && error.message.includes('API key not valid')) {
            throw new Error("AI features are unavailable. The provided API key is invalid. Please check your deployment configuration.");
        }
        throw new Error("Error generating skill assessment. Please try again.");
    }
};
