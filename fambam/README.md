## AI PDF Prompt API (Node.js)

This project exposes a simple Node.js/Express API that:

- **Accepts a prompt** in the request body.
- **Uploads a `prompt.pdf` file to OpenAI and attaches it to the request**.
- **Lets the model read/search the PDF via `file_search` tools**.
- **Returns the AI response** in the API response.

### 1. Prerequisites

- **Node.js** 18+ installed.
- An **OpenAI API key** with access to the latest models.

### 2. Setup

1. **Clone or open this project** in the `fambam` directory.

2. **Install dependencies**:

```bash
cd fambam
npm install
```

3. **Create your `.env` file** based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and set:

```bash
OPENAI_API_KEY=your_real_openai_api_key
PORT=3000
```

4. **Add your `prompt.pdf` file** to the project root (same folder as `package.json`).  
   The server will upload this PDF to OpenAI and attach it to each request so the model can read/search it directly.

### 3. Run the server

```bash
npm start
```

The server will start (by default) at `http://localhost:3000`.

### 4. API Usage

- **Endpoint**: `POST /api/generate`
- **Body (JSON)**:

```json
{
  "prompt": "Explain the content of the PDF in simple terms."
}
```

- **Example with `curl`**:

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Summarize the PDF for a 10 year old."}'
```

- **Response (JSON)**:

```json
{
  "response": "AI-generated answer here, based on your prompt and the prompt.pdf content."
}
```

### 5. Notes

- The server **expects `prompt.pdf` to exist** in the project root. If it is missing, the API will return an error.
- The code uses the **OpenAI Responses API** with a `file_search` attachment so the model can read and reason over the PDF content directly.

