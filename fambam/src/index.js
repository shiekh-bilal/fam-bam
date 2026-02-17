const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const OpenAI = require("openai");

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY in .env");
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Cache the uploaded PDF file ID so we only upload once per server process.
let pdfFileId = null;

/**
 * POST /api/generate
 * Body: { "prompt": "your prompt here" }
 *
 * This endpoint:
 * - Reads prompt.pdf from the project root
 * - Sends the user prompt + the PDF to OpenAI
 * - Returns the AI's text response
 */
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body || {};

    console.log("pdfFileId = ", pdfFileId);

    console.log("prompt = ", prompt);

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Field 'prompt' is required and must be a string." });
    }

    const pdfPath = path.join(__dirname, "..", "prompt.pdf");

    if (!fs.existsSync(pdfPath)) {
      return res.status(500).json({ error: "prompt.pdf not found. Place it in the project root." });
    }

    // Upload the PDF file to OpenAI only once and reuse its file_id.
    if (!pdfFileId) {
      const file = await openai.files.create({
        file: fs.createReadStream(pdfPath),
        purpose: "assistants",
      });
      pdfFileId = file.id;
      console.log("Uploaded prompt.pdf to OpenAI. file_id =", pdfFileId);
    }

    // Use that file in a response
    const response = await openai.responses.create({
      model: "gpt-5.2",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: req.body.prompt }, // your dynamic prompt
            { type: "input_file", file_id: pdfFileId }     // cached prompt.pdf
          ]
        }
      ]
    });

    if (response) {
      console.log("response = ", response);
    }

    // Extract plain text from the response
    let text = "";
    if (response && response.output && Array.isArray(response.output)) {
      const firstItem = response.output[0];
      if (firstItem && Array.isArray(firstItem.content)) {
        const textPart = firstItem.content.find(
          (c) => c.type === "output_text" || c.type === "text"
        );
        if (textPart) {
          text = textPart.text?.value || textPart.text || "";
        }
      }
    }

    if (!text) {
      text = JSON.stringify(response, null, 2);
    }

    return res.status(200).json({ response: text});
  } catch (err) {
    console.error("Error in /api/generate:", err);
    return res.status(500).json({
      error: "Failed to generate response from OpenAI.",
      details: err.message || String(err),
    });
  }
});

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "AI PDF prompt API is running." });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

