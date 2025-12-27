import { generateText } from "../libs/gemini.js";

export const chatWithGemini = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        message: "Message is required",
      });
    }
    const reply = await generateText(message);

    return res.status(200).json({
      reply,
    });
  } catch (error) {
    console.error("===== GEMINI ERROR =====");
    console.error(error);
    return res.status(500).json({
      message: error.message || "Gemini API error",
    });
  }
};
