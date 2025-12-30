const { embedText, generateAnswerWithContext } = require('../services/openRouterService');
const { searchKnowledge } = require('../services/vectorSearchService');

const queryController = async (req, res) => {
  try {
    const { query, language } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Step 1: Generate query embedding via OpenRouter
    const queryEmbedding = await embedText(query);

    // Step 2: Build filter and run vector search in MongoDB Atlas
    const filter = {};
    if (language && language !== 'all') {
      filter.language = language;
    }

    const results = await searchKnowledge({
      embedding: queryEmbedding,
      filter,
      k: 8,
    });

    // Step 3: Generate answer with retrieved context
    const aiResponse = await generateAnswerWithContext({
      query,
      context: results,
    });

    // Step 7: Parse response to extract code blocks
    const secureCodeMatch = aiResponse.match(/```(?:[a-zA-Z0-9]+)?\n([\s\S]*?)```/);
    const insecureCodeMatch = aiResponse.match(/```(?:[a-zA-Z0-9]+)?\n([\s\S]*?)```/g);

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
      is_forbidden: false,
      forbidden_message: null,
      approved_alternative: null,
      danger_reason: insecureCode
        ? 'This code snippet is marked as insecure in the explanation above.'
        : null,
      sources: results.map((r) => r.source),
    };

    res.json(response);
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ error: 'Failed to process query', details: error.message });
  }
};

module.exports = { queryController };

