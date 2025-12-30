const SecurityPractice = require('../models/SecurityPractice');
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
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

// Generate embedding using OpenAI
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
    return Array(1536).fill(0).map(() => Math.random());
  }
};

// Chunk text by meaning (simple sentence-based chunking)
const chunkContent = (text, maxChunkSize = 500) => {
  const sentences = text.split(/[.!?]\s+/);
  const chunks = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? '. ' : '') + sentence;
    }
  }
  if (currentChunk) chunks.push(currentChunk.trim());

  return chunks;
};

// Extract metadata from content
const extractMetadata = (content, filename) => {
  const metadata = {
    language: 'all',
    topic: 'general',
    type: 'secure',
    severity: 'warning'
  };

  // Detect language
  if (filename.toLowerCase().includes('node') || filename.toLowerCase().includes('js') || filename.toLowerCase().includes('javascript')) {
    metadata.language = 'javascript';
  } else if (filename.toLowerCase().includes('python') || filename.toLowerCase().includes('py')) {
    metadata.language = 'python';
  } else if (filename.toLowerCase().includes('go')) {
    metadata.language = 'go';
  }

  // Detect topic
  const lowerContent = content.toLowerCase();
  if (lowerContent.includes('jwt') || lowerContent.includes('token')) {
    metadata.topic = 'jwt';
  } else if (lowerContent.includes('password') || lowerContent.includes('hash')) {
    metadata.topic = 'password_hashing';
  } else if (lowerContent.includes('encrypt') || lowerContent.includes('crypto')) {
    metadata.topic = 'encryption';
  } else if (lowerContent.includes('auth') || lowerContent.includes('authentication')) {
    metadata.topic = 'authentication';
  }

  // Detect type (secure vs forbidden)
  if (lowerContent.includes('forbidden') || lowerContent.includes('must not') || lowerContent.includes('never') || lowerContent.includes('avoid')) {
    metadata.type = 'forbidden';
  }

  // Detect severity
  if (lowerContent.includes('critical') || lowerContent.includes('vulnerability') || lowerContent.includes('exploit')) {
    metadata.severity = 'critical';
  }

  return metadata;
};

const uploadController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    let text = '';

    // Step 1: Extract text based on file type
    if (file.mimetype === 'application/pdf') {
      const dataBuffer = await fs.readFile(file.path);
      const pdfData = await pdfParse(dataBuffer);
      text = pdfData.text;
    } else if (file.mimetype === 'text/markdown' || file.originalname.endsWith('.md')) {
      text = await fs.readFile(file.path, 'utf-8');
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Only PDF and Markdown files are supported.' });
    }

    // Step 2: Chunk the content
    const chunks = chunkContent(text);

    // Step 3: Process each chunk
    const results = [];
    for (const chunk of chunks) {
      if (chunk.length < 50) continue; // Skip very short chunks

      const metadata = extractMetadata(chunk, file.originalname);

      // Step 4: Generate embedding
      const embedding = await generateEmbedding(chunk);

      // Step 5: Save to database
      const practice = new SecurityPractice({
        content: chunk,
        embedding: embedding,
        language: metadata.language,
        topic: metadata.topic,
        type: metadata.type,
        severity: metadata.severity,
        source: file.originalname,
        metadata: {
          reason: metadata.type === 'forbidden' ? 'Violates company security policy' : null
        }
      });

      await practice.save();
      results.push({
        content: chunk.substring(0, 100) + '...',
        type: metadata.type,
        topic: metadata.topic
      });
    }

    // Clean up uploaded file
    await fs.unlink(file.path);

    res.json({
      message: 'File processed successfully',
      chunksProcessed: results.length,
      results: results
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process file', details: error.message });
  }
};

module.exports = { uploadController };

