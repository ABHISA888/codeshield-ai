const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const { chunkContent } = require('../utils/chunker');
const { embedText } = require('../services/openRouterService');
const { insertKnowledgeChunks } = require('../services/vectorSearchService');

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
    let rawText = '';
    let languageHint = req.body.language || 'all';
    let categoryHint = req.body.category || 'policy';
    let source = req.body.source || 'manual-upload';

    // Support either raw text (JSON) or file upload (PDF/MD/TXT)
    if (req.body.text && typeof req.body.text === 'string') {
      rawText = req.body.text;
    } else if (req.file) {
      const file = req.file;
      source = `file:${file.originalname}`;

      if (file.mimetype === 'application/pdf') {
        const dataBuffer = await fs.readFile(file.path);
        const pdfData = await pdfParse(dataBuffer);
        rawText = pdfData.text;
      } else if (
        file.mimetype === 'text/markdown' ||
        file.mimetype === 'text/plain' ||
        file.originalname.endsWith('.md') ||
        file.originalname.endsWith('.txt')
      ) {
        rawText = await fs.readFile(file.path, 'utf-8');
      } else {
        return res.status(400).json({
          error:
            'Unsupported file type. Only PDF, Markdown (.md) and Text (.txt) files are supported.',
        });
      }

      // Ensure temp file is removed
      await fs.unlink(file.path).catch(() => {});
    } else {
      return res.status(400).json({ error: 'No text or file provided' });
    }

    if (!rawText || !rawText.trim()) {
      return res.status(400).json({ error: 'Uploaded content is empty' });
    }

    // Step 1: Chunk content semantically
    const baseMetadata = {
      language: languageHint,
      category: categoryHint,
      source,
    };
    const chunkDocs = chunkContent(rawText, baseMetadata);

    // Step 2: Embed each chunk and prepare documents
    const enrichedChunks = [];
    for (const chunk of chunkDocs) {
      if (!chunk.content || chunk.content.length < 50) continue;

      const inferred = extractMetadata(chunk.content, source);

      const embedding = await embedText(chunk.content);

      enrichedChunks.push({
        content: chunk.content,
        embedding,
        language: inferred.language || baseMetadata.language,
        category: inferred.topic || baseMetadata.category,
        source: baseMetadata.source,
        metadata: {
          chunkIndex: chunk.chunkIndex,
          totalChunks: chunk.totalChunks,
          tokenCount: chunk.tokenCount,
          severity: inferred.severity,
          type: inferred.type,
        },
      });
    }

    await insertKnowledgeChunks(enrichedChunks);

    res.json({
      message: 'Document ingested successfully',
      chunksProcessed: enrichedChunks.length,
      source,
      language: languageHint,
      category: categoryHint,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process file', details: error.message });
  }
};

module.exports = { uploadController };

