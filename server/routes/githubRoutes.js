const express = require('express');
const router = express.Router();
const {
  ingestGithubFile,
  listUserRepos,
  getRepoTree,
  analyzeGithubFile,
} = require('../services/githubService');

// GET /api/github/repos - list all repos for authenticated user
router.get('/repos', async (req, res) => {
  try {
    const repos = await listUserRepos();
    res.json({ repos });
  } catch (error) {
    console.error('GitHub repos error:', error);
    res.status(500).json({
      error: 'Failed to fetch GitHub repositories',
      details: error.message,
    });
  }
});

// GET /api/github/tree?repoUrl=...&branch=... - get repo file tree
router.get('/tree', async (req, res) => {
  try {
    const { repoUrl, branch } = req.query;

    if (!repoUrl) {
      return res.status(400).json({ error: 'repoUrl is required' });
    }

    const tree = await getRepoTree({ repoUrl, branch });
    res.json(tree);
  } catch (error) {
    console.error('GitHub tree error:', error);
    res.status(500).json({
      error: 'Failed to fetch GitHub repository tree',
      details: error.message,
    });
  }
});

// POST /api/github/scan - bulk ingest a single file into knowledge base (existing)
router.post('/scan', async (req, res) => {
  try {
    const { repoUrl, filePath } = req.body;

    if (!repoUrl || !filePath) {
      return res.status(400).json({ error: 'repoUrl and filePath are required' });
    }

    const result = await ingestGithubFile({ repoUrl, filePath });

    res.json({
      message: 'GitHub file ingested successfully',
      ...result,
    });
  } catch (error) {
    console.error('GitHub scan error:', error);
    res.status(500).json({
      error: 'Failed to scan GitHub file',
      details: error.message,
    });
  }
});

// POST /api/github/analyze-file - check single file against policies
router.post('/analyze-file', async (req, res) => {
  try {
    const { repoUrl, filePath } = req.body;

    if (!repoUrl || !filePath) {
      return res.status(400).json({ error: 'repoUrl and filePath are required' });
    }

    const result = await analyzeGithubFile({ repoUrl, filePath });

    res.json(result);
  } catch (error) {
    console.error('GitHub analyze error:', error);
    res.status(500).json({
      error: 'Failed to analyze GitHub file',
      details: error.message,
    });
  }
});

module.exports = router;


