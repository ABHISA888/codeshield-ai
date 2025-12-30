const SecurityPractice = require('../models/SecurityPractice');
const OpenAI = require('openai');

// Lazy initialization of OpenAI client
const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
};

// Simple embedding function (in production, use OpenAI embeddings API)
const generateEmbedding = async (text) => {
  const openai = getOpenAIClient();
  if (!openai) {
    // Fallback: return a simple hash-based embedding for demo
    console.warn('OpenAI API key not set. Using fallback embeddings.');
    return Array(1536).fill(0).map(() => Math.random());
  }
  
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    // Fallback: return a simple hash-based embedding for demo
    return Array(1536).fill(0).map(() => Math.random());
  }
};

// Simple cosine similarity (for demo - in production use MongoDB Atlas Vector Search)
const cosineSimilarity = (vecA, vecB) => {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

// Fallback response generator when OpenAI is not available
const generateFallbackResponse = (query, topSecure, topForbidden, isForbidden) => {
  if (isForbidden && topForbidden.length > 0) {
    return `🚫 Request Rejected

This practice is forbidden per company security policy.

Reason: ${topForbidden[0].practice.metadata?.reason || 'Violates security standards'}

${topSecure.length > 0 ? `\n✅ Approved Alternative:\n${topSecure[0].practice.content}` : ''}

Please use the approved secure practices instead.`;
  }

  if (topSecure.length > 0) {
    return `Based on company security policies, here's the approved approach:

${topSecure[0].practice.content}

${topSecure.length > 1 ? `\nAdditional secure practices:\n${topSecure.slice(1).map((item, idx) => `${idx + 1}. ${item.practice.content}`).join('\n')}` : ''}

Note: This response is generated from your organization's security knowledge base. For full AI-powered responses, please configure the OPENAI_API_KEY environment variable.`;
  }

  return `I understand you're asking about: "${query}"

To provide secure coding guidance, please upload security documentation (PDF or Markdown files) to build the knowledge base.

Note: For AI-powered responses with code examples, please configure the OPENAI_API_KEY environment variable.`;
};

const queryController = async (req, res) => {
  try {
    const { query, language } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Step 1: Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Step 2: Search for secure practices
    const allPractices = await SecurityPractice.find({
      ...(language && language !== 'all' ? { language: { $in: [language, 'all'] } } : {})
    });

    // Step 3: Calculate similarity scores
    const practicesWithScores = allPractices.map(practice => ({
      practice,
      score: cosineSimilarity(queryEmbedding, practice.embedding)
    }));

    // Step 4: Sort by similarity and get top results
    practicesWithScores.sort((a, b) => b.score - a.score);
    const topSecure = practicesWithScores
      .filter(item => item.practice.type === 'secure')
      .slice(0, 3);
    const topForbidden = practicesWithScores
      .filter(item => item.practice.type === 'forbidden')
      .slice(0, 2);

    // Step 5: Check if query matches forbidden practices
    const isForbidden = topForbidden.length > 0 && topForbidden[0].score > 0.7;

    // Step 6: Generate AI response using OpenAI
    const openai = getOpenAIClient();
    let aiResponse = '';

    if (openai) {
      let systemPrompt = `You are CodeShield AI, a security-focused coding assistant that enforces company security policies.

Your responses must:
1. Provide secure, approved code examples
2. Explain why the code is secure
3. Show insecure alternatives when relevant
4. Reference company security policies when available

${topSecure.length > 0 ? `\nRelevant secure practices:\n${topSecure.map((item, idx) => `${idx + 1}. ${item.practice.content}`).join('\n')}` : ''}

${topForbidden.length > 0 ? `\nForbidden practices to avoid:\n${topForbidden.map((item, idx) => `${idx + 1}. ${item.practice.content}${item.practice.metadata?.reason ? ` - Reason: ${item.practice.metadata.reason}` : ''}`).join('\n')}` : ''}`;

      if (isForbidden) {
        systemPrompt += `\n\n⚠️ WARNING: The user's query appears to request a forbidden practice. You MUST:
1. Reject the request clearly
2. Explain why it's forbidden
3. Provide an approved alternative from the secure practices above`;
      }

      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query }
          ],
          temperature: 0.3,
        });
        aiResponse = completion.choices[0].message.content;
      } catch (error) {
        console.error('OpenAI API error:', error);
        // Fallback response
        aiResponse = generateFallbackResponse(query, topSecure, topForbidden, isForbidden);
      }
    } else {
      // Fallback response when OpenAI is not configured
      console.warn('OpenAI API key not set. Using fallback response.');
      aiResponse = generateFallbackResponse(query, topSecure, topForbidden, isForbidden);
    }

    // Step 7: Parse response to extract code blocks
    const secureCodeMatch = aiResponse.match(/```(?:javascript|python|go|java|typescript|js|py)?\n([\s\S]*?)```/);
    const insecureCodeMatch = aiResponse.match(/```(?:javascript|python|go|java|typescript|js|py)?\n([\s\S]*?)```/g);

    let secureCode = '';
    let insecureCode = '';
    let explanation = aiResponse;

    if (secureCodeMatch) {
      secureCode = secureCodeMatch[1].trim();
      explanation = explanation.replace(secureCodeMatch[0], '').trim();
    }

    if (insecureCodeMatch && insecureCodeMatch.length > 1) {
      insecureCode = insecureCodeMatch[1].replace(/```[\w]*\n?/g, '').trim();
    }

    // Step 8: Build response
    const response = {
      secure_code: secureCode || null,
      insecure_code: insecureCode || null,
      explanation: explanation,
      is_forbidden: isForbidden,
      forbidden_message: isForbidden && topForbidden[0]?.practice.metadata?.reason 
        ? topForbidden[0].practice.metadata.reason 
        : null,
      approved_alternative: isForbidden && topSecure[0]?.practice.content 
        ? topSecure[0].practice.content 
        : null,
      danger_reason: insecureCode ? 'This code violates security best practices and company policies.' : null,
      sources: [
        ...topSecure.map(item => item.practice.source),
        ...topForbidden.map(item => item.practice.source)
      ].filter((v, i, a) => a.indexOf(v) === i)
    };

    res.json(response);
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ error: 'Failed to process query', details: error.message });
  }
};

module.exports = { queryController };

