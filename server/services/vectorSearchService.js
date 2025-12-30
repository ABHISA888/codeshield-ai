const mongoose = require('mongoose');

const COLLECTION_NAME = 'security_knowledge';
const VECTOR_INDEX_NAME = 'vector_index';

/**
 * Get underlying MongoDB collection via mongoose connection.
 */
const getCollection = () => {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('MongoDB connection is not initialized');
  }
  return db.collection(COLLECTION_NAME);
};

/**
 * Insert knowledge chunks into MongoDB.
 * Each chunk must already contain a 1536-dim embedding.
 * @param {Array<Object>} chunks
 */
const insertKnowledgeChunks = async (chunks) => {
  if (!Array.isArray(chunks) || chunks.length === 0) return;

  const collection = getCollection();
  await collection.insertMany(
    chunks.map((chunk) => ({
      content: chunk.content,
      embedding: chunk.embedding,
      language: chunk.language || 'all',
      category: chunk.category || 'general',
      source: chunk.source,
      metadata: chunk.metadata || {},
      createdAt: new Date(),
    }))
  );
};

/**
 * Run a vector search query against MongoDB Atlas Vector Search.
 * @param {Object} params
 * @param {number[]} params.embedding - 1536-dim query vector
 * @param {Object} [params.filter] - Additional filter for language/category
 * @param {number} [params.k] - Number of results to return
 */
const searchKnowledge = async ({ embedding, filter = {}, k = 8 }) => {
  if (!Array.isArray(embedding) || embedding.length !== 1536) {
    throw new Error('Query embedding must be a 1536-dimensional vector');
  }

  const collection = getCollection();

  const pipeline = [
    {
      $vectorSearch: {
        index: VECTOR_INDEX_NAME,
        path: 'embedding',
        queryVector: embedding,
        numCandidates: Math.max(k * 10, 200),
        limit: k,
        filter,
      },
    },
    {
      $project: {
        content: 1,
        language: 1,
        category: 1,
        source: 1,
        metadata: 1,
        score: { $meta: 'vectorSearchScore' },
      },
    },
  ];

  const cursor = collection.aggregate(pipeline);
  const results = await cursor.toArray();
  return results;
};

module.exports = {
  insertKnowledgeChunks,
  searchKnowledge,
};


