/**
 * Semantic chunking utility for RAG pipeline
 * Chunks text into 500-700 token chunks with overlap
 */

const CHUNK_SIZE = 600; // Target tokens (~450-500 words)
const OVERLAP_SIZE = 100; // Overlap tokens (~75-100 words)
const MIN_CHUNK_SIZE = 200; // Minimum chunk size to keep

/**
 * Estimate token count (rough approximation: 1 token ≈ 0.75 words)
 */
const estimateTokens = (text) => {
  const words = text.split(/\s+/).length;
  return Math.ceil(words * 1.33);
};

/**
 * Split text into sentences while preserving punctuation
 */
const splitIntoSentences = (text) => {
  // Split on sentence endings, but keep the punctuation
  const sentences = text.match(/[^.!?]+[.!?]+[\])'"`'"]*|.+/g) || [text];
  return sentences.map(s => s.trim()).filter(s => s.length > 0);
};

/**
 * Chunk text semantically with overlap
 * @param {string} text - Text to chunk
 * @param {Object} options - Chunking options
 * @returns {Array<{content: string, startIndex: number, endIndex: number}>}
 */
const chunkText = (text, options = {}) => {
  const {
    chunkSize = CHUNK_SIZE,
    overlapSize = OVERLAP_SIZE,
    minChunkSize = MIN_CHUNK_SIZE
  } = options;

  if (!text || text.trim().length === 0) {
    return [];
  }

  const chunks = [];
  const sentences = splitIntoSentences(text);
  
  if (sentences.length === 0) {
    return [];
  }

  let currentChunk = '';
  let currentTokens = 0;
  let startIndex = 0;
  let sentenceIndex = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const sentenceTokens = estimateTokens(sentence);
    const newTotalTokens = currentTokens + sentenceTokens;

    // If adding this sentence would exceed chunk size, save current chunk
    if (newTotalTokens > chunkSize && currentChunk.length > 0) {
      // Save the chunk
      chunks.push({
        content: currentChunk.trim(),
        startIndex,
        endIndex: startIndex + currentChunk.length,
        tokenCount: currentTokens
      });

      // Start new chunk with overlap
      const overlapText = getOverlapText(currentChunk, overlapSize);
      currentChunk = overlapText + ' ' + sentence;
      currentTokens = estimateTokens(currentChunk);
      startIndex = chunks.length > 0 
        ? chunks[chunks.length - 1].endIndex - overlapText.length 
        : 0;
    } else {
      // Add sentence to current chunk
      if (currentChunk.length === 0) {
        startIndex = i === 0 ? 0 : chunks.length > 0 
          ? chunks[chunks.length - 1].endIndex 
          : 0;
      }
      currentChunk += (currentChunk.length > 0 ? ' ' : '') + sentence;
      currentTokens = newTotalTokens;
    }
  }

  // Add the last chunk if it meets minimum size
  if (currentChunk.trim().length > 0 && currentTokens >= minChunkSize) {
    chunks.push({
      content: currentChunk.trim(),
      startIndex,
      endIndex: startIndex + currentChunk.length,
      tokenCount: currentTokens
    });
  } else if (currentChunk.trim().length > 0 && chunks.length > 0) {
    // Merge small last chunk with previous chunk
    chunks[chunks.length - 1].content += ' ' + currentChunk.trim();
    chunks[chunks.length - 1].endIndex = startIndex + currentChunk.length;
    chunks[chunks.length - 1].tokenCount += currentTokens;
  }

  return chunks;
};

/**
 * Get overlap text from the end of current chunk
 */
const getOverlapText = (text, overlapTokens) => {
  const words = text.split(/\s+/);
  const overlapWords = Math.ceil(overlapTokens / 1.33);
  const startIndex = Math.max(0, words.length - overlapWords);
  return words.slice(startIndex).join(' ');
};

/**
 * Chunk PDF or long text content
 * @param {string} content - Content to chunk
 * @param {Object} metadata - Metadata to attach to each chunk
 * @returns {Array<Object>} Array of chunk objects with metadata
 */
const chunkContent = (content, metadata = {}) => {
  const chunks = chunkText(content);
  
  return chunks.map((chunk, index) => ({
    content: chunk.content,
    chunkIndex: index,
    totalChunks: chunks.length,
    tokenCount: chunk.tokenCount,
    ...metadata
  }));
};

module.exports = {
  chunkText,
  chunkContent,
  estimateTokens
};

