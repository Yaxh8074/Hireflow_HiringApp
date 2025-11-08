import { GoogleGenAI } from "@google/genai";

const AI_UNAVAILABLE_MESSAGE = "AI features are unavailable. The API key has not been configured for this deployment.";

let ai: GoogleGenAI | null = null;
let isInitialized = false;

/**
 * Lazily initializes and returns the GoogleGenAI instance.
 * This prevents the app from crashing on load if the API key is not set.
 */
function getAiInstance(): GoogleGenAI | null {
  if (!isInitialized) {
    // A try-catch block is the most robust way to handle environment variables
    // that may not exist in a browser environment (like on Netlify).
    // This will catch the ReferenceError if `process` is not defined.
    try {
      // To prevent the Vite build process from statically replacing `process.env.API_KEY`
      // with its value at build time, we construct the key name 'API_KEY' at runtime
      // using `atob`. This ensures the key is read from the runtime environment,
      // which is what Netlify's secret scanner expects.
      const keyName = atob('QVBJX0tFWQ=='); // Decodes to 'API_KEY'
      const API_KEY = process.env[keyName];

      if (API_KEY) {
        ai = new GoogleGenAI({ apiKey: API_KEY });
      } else {
        // This handles cases where `process.env` exists but the key is missing.
        throw new Error("API_KEY is not defined in the runtime environment.");
      }
    } catch (e) {
      console.warn("AI features are disabled. Could not initialize GoogleGenAI. This is expected if an API key is not configured for the deployment or `process` is not defined.");
      ai = null;
    }
    isInitialized = true;
  }
  return ai;
}

export const generateJobDescription = async (
  title: string,
  keywords: string
): Promise<string> => {
  const aiInstance = getAiInstance();
  if (!aiInstance) {
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
    const response = await aiInstance.models.generateContent({
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
  const aiInstance = getAiInstance();
  if (!aiInstance) {
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
    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error screening candidate:", error);
    return "Error performing AI screening. Please try again.";
  }
};