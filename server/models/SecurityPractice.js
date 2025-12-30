const mongoose = require('mongoose');

/**
 * Security knowledge document schema
 * Backed by MongoDB Atlas Vector Search index: `vector_index`
 *
 * NOTE: The actual vector index is configured in Atlas UI using:
 *  - collection: security_knowledge
 *  - path: embedding
 *  - numDimensions: 1536
 *  - similarity: cosine
 */
const securityKnowledgeSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    // 1536-dim embedding vector (text-embedding-3-small)
    embedding: {
      type: [Number],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length === 1536,
        message: 'Embedding must be a 1536-dimensional vector',
      },
    },
    language: {
      type: String,
      required: true,
      default: 'all',
      index: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    source: {
      type: String,
      required: true,
      index: true,
    },
    metadata: {
      type: Object,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'security_knowledge',
  }
);

module.exports = mongoose.model('SecurityKnowledge', securityKnowledgeSchema);


