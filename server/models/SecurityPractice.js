const mongoose = require('mongoose');

const securityPracticeSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    index: true
  },
  embedding: {
    type: [Number],
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ['all', 'javascript', 'python', 'go', 'java', 'typescript', 'node.js'],
    default: 'all',
    index: true
  },
  topic: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['secure', 'forbidden'],
    index: true
  },
  severity: {
    type: String,
    enum: ['critical', 'warning', 'info'],
    default: 'warning'
  },
  source: {
    type: String,
    required: true
  },
  metadata: {
    headers_used: [String],
    reason: String,
    approved_alternative: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create vector index for embeddings (MongoDB Atlas Vector Search)
securityPracticeSchema.index({ embedding: '2dsphere' });

module.exports = mongoose.model('SecurityPractice', securityPracticeSchema);

