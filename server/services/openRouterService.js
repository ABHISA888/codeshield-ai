const OpenAI = require('openai');

/**
 * OpenRouter client wrapper
 * Uses OpenAI-compatible SDK with OpenRouter base URL.
 */
const createClient = () => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set');
  }

  return new OpenAI({
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
  });
};

/**
 * Generate a 1536-dim embedding for the given text using text-embedding-3-small.
 * @param {string} text
 * @returns {Promise<number[]>}
 */
const embedText = async (text) => {
  const client = createClient();

  const response = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  const embedding = response.data[0].embedding;

  if (!Array.isArray(embedding) || embedding.length !== 1536) {
    throw new Error(
      `Unexpected embedding dimensions: got ${embedding.length}, expected 1536`
    );
  }

  return embedding;
};

/**
 * Call LLM with retrieved context.
 * @param {Object} params
 * @param {string} params.query
 * @param {Array<{content: string, source: string, language: string, category: string}>} params.context
 * @returns {Promise<string>}
 */
const generateAnswerWithContext = async ({ query, context }) => {
  const client = createClient();

  const contextText =
    context && context.length
      ? context
          .map(
            (doc, idx) =>
              `Source ${idx + 1} (${doc.source} - ${doc.language}/${doc.category}):\n${doc.content}`
          )
          .join('\n\n')
      : 'No security knowledge documents were retrieved.';

  const systemPrompt = `
You are CodeShield AI, a private, compliance-aware security assistant.
Use ONLY the provided context to answer. If the answer is not in the context, say you don't know.
Always:
- Prefer secure, modern algorithms and practices
- Avoid deprecated or insecure patterns
- Highlight any forbidden or dangerous practices if present in the context
`;

  const completion = await client.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'system',
        content: `Security knowledge context:\n\n${contextText}`,
      },
      { role: 'user', content: query },
    ],
    temperature: 0.2,
  });

  return completion.choices[0].message.content;
};

module.exports = {
  embedText,
  generateAnswerWithContext,
};


