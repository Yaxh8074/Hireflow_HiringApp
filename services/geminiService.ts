
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateJobDescription = async (
  title: string,
  keywords: string
): Promise<string> => {
  if (!API_KEY) return "API Key not configured. Please set the API_KEY environment variable.";

  const prompt = `
    Generate a professional and engaging job description for the following role.
    The tone should be encouraging and clear, aimed at attracting top talent.
    Structure it with the following sections: "About the Role", "Key Responsibilities", and "Qualifications".
    
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
    return "Error generating description. Please try again.";
  }
};


export const screenCandidate = async (
  jobDescription: string,
  candidateSummary: string
): Promise<string> => {
  if (!API_KEY) return "API Key not configured. Please set the API_KEY environment variable.";
  
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
    return "Error performing AI screening. Please try again.";
  }
};
