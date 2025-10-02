import { GoogleGenAI } from "@google/genai";

// Assume process.env.API_KEY is available
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const getCrossStitchInstructions = async (
  widthInStitches: number,
  heightInStitches: number,
  fabricCountString: string,
  colorName: string,
  dmcNumber: string
): Promise<string> => {
  const fabricCount = parseInt(fabricCountString.split('-')[0], 10) || 14;
  const widthInInches = (widthInStitches / fabricCount).toFixed(1);
  const heightInInches = (heightInStitches / fabricCount).toFixed(1);

  const prompt = `
    Generate a set of beginner-friendly cross-stitch instructions for a simple, single-color silhouette pattern.
    The tone should be encouraging and clear. Format the output with clear headings using markdown bold for titles.

    Include the following sections and information:

    1.  **Pattern Details**:
        *   Stitch Count: ${widthInStitches} stitches wide by ${heightInStitches} stitches high.
        *   Finished Size: Approximately ${widthInInches} inches wide by ${heightInInches} inches high when stitched on ${fabricCount}-count Aida fabric. Mention that the size will change if they use a different fabric count.

    2.  **Materials Needed**:
        *   Fabric: Suggest ${fabricCount}-count Aida cloth in a color that contrasts with the thread.
        *   Embroidery Floss: Recommend a single color. For this pattern, the suggested color is "${colorName} (DMC ${dmcNumber})".
        *   Tapestry Needle: Suggest a size 24 or 26 needle for ${fabricCount}-count fabric.
        *   Embroidery Hoop: Mention it's optional but helps keep fabric tension even.
        *   Scissors.

    3.  **Getting Started**:
        *   Briefly explain how to find the center of the fabric by folding it.
        *   Explain that each symbol (circle or square) on the pattern chart corresponds to one full cross stitch.

    4.  **How to Cross Stitch**:
        *   Provide simple, numbered steps for making a single cross stitch.
        *   Emphasize the importance of making all the top stitches go in the same direction for a neat finish (e.g., all bottom stitches like \\ and all top stitches like /).

    5.  **Finishing Your Project**:
        *   Give brief instructions on how to hand wash and gently press the finished piece from the back.

    Do not include any introductory or concluding sentences outside of these instructions, like "Here are the instructions..." or "Happy stitching!".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating cross-stitch instructions:", error);
    // Return a fallback message
    return "Could not generate instructions. Please check your connection or API key setup.";
  }
};