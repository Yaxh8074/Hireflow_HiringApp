import { GoogleGenAI } from "@google/genai";

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
