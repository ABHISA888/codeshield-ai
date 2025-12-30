const axios = require('axios');
const { chunkContent } = require('../utils/chunker');
const { embedText, generateAnswerWithContext } = require('./openRouterService');
const { insertKnowledgeChunks, searchKnowledge } = require('./vectorSearchService');

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Parse a GitHub repo URL into owner/repo
 */
const parseRepoUrl = (repoUrl) => {
  try {
    const url = new URL(repoUrl);
    const parts = url.pathname.replace(/^\/+/, '').split('/');
    if (parts.length < 2) {
      throw new Error('Invalid GitHub repository URL');
    }
    return {
      owner: parts[0],
      repo: parts[1].replace(/\.git$/, ''),
    };
  } catch (err) {
    throw new Error('Invalid GitHub repository URL');
  }
};

const getAuthHeaders = () => {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN is not configured');
  }
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'codeshield-ai',
  };
};

/**
 * List all repositories for the authenticated user
 */
const listUserRepos = async () => {
  const headers = getAuthHeaders();

  const res = await axios.get(`${GITHUB_API_BASE}/user/repos`, {
    headers,
    params: {
      per_page: 100,
      sort: 'updated',
      direction: 'desc',
    },
  });

  return res.data.map((repo) => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    private: repo.private,
    defaultBranch: repo.default_branch,
    htmlUrl: repo.html_url,
  }));
};

/**
 * Get a recursive file tree for a repository (like VS Code explorer)
 */
const getRepoTree = async ({ repoUrl, branch }) => {
  const headers = getAuthHeaders();
  const { owner, repo } = parseRepoUrl(repoUrl);

  // Get repo details to resolve default branch if not provided
  const repoRes = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
    headers,
  });

  const defaultBranch = branch || repoRes.data.default_branch;

  // Get tree SHA for branch
  const refRes = await axios.get(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${defaultBranch}`,
    { headers, params: { recursive: 1 } }
  );

  const tree = refRes.data.tree
    .filter((item) => item.type === 'blob') // files only; folders inferred on frontend
    .map((item) => ({
      path: item.path,
      type: item.type,
      size: item.size,
    }));

  return {
    owner,
    repo,
    branch: defaultBranch,
    files: tree,
  };
};

/**
 * Fetch a single file content from GitHub
 */
const fetchGithubFile = async ({ repoUrl, filePath }) => {
  const headers = {
    ...getAuthHeaders(),
    Accept: 'application/vnd.github.v3.raw',
  };

  const { owner, repo } = parseRepoUrl(repoUrl);

  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${filePath}`;
  const res = await axios.get(url, {
    headers,
  });

  return {
    content:
      typeof res.data === 'string'
        ? res.data
        : Buffer.from(res.data.content, res.data.encoding || 'base64').toString('utf-8'),
    owner,
    repo,
  };
};

/**
 * Ingest a GitHub file into the security knowledge base
 */
const ingestGithubFile = async ({ repoUrl, filePath }) => {
  const { content, owner, repo } = await fetchGithubFile({ repoUrl, filePath });

  const language = detectLanguageFromPath(filePath);
  const source = `github:${owner}/${repo}:${filePath}`;

  const baseMetadata = {
    language,
    category: 'github_code',
    source,
  };

  const chunks = chunkContent(content, baseMetadata);

  const docs = [];
  for (const chunk of chunks) {
    if (!chunk.content || chunk.content.length < 50) continue;

    const embedding = await embedText(chunk.content);

    docs.push({
      content: chunk.content,
      embedding,
      language,
      category: 'github_code',
      source,
      metadata: {
        chunkIndex: chunk.chunkIndex,
        totalChunks: chunk.totalChunks,
        tokenCount: chunk.tokenCount,
      },
    });
  }

  await insertKnowledgeChunks(docs);

  return {
    source,
    chunksIngested: docs.length,
    language,
  };
};

/**
 * Analyze a single GitHub file for compliance against company policies.
 */
const analyzeGithubFile = async ({ repoUrl, filePath }) => {
  const { content, owner, repo } = await fetchGithubFile({ repoUrl, filePath });

  const language = detectLanguageFromPath(filePath);
  const source = `github:${owner}/${repo}:${filePath}`;

  // Embed the file content
  const embedding = await embedText(content);

  // Retrieve relevant security knowledge
  const results = await searchKnowledge({
    embedding,
    filter: {
      $or: [{ language }, { language: 'all' }],
    },
    k: 8,
  });

  const llmAnswer = await generateAnswerWithContext({
    query: `You are reviewing a source code file for compliance with company security policies.\n\nFile path: ${filePath}\nLanguage: ${language}\n\n1. Is this file compliant with the policies in the context? Answer strictly with one of: COMPLIANT, PARTIALLY_COMPLIANT, or NON_COMPLIANT.\n2. List concrete reasons (referencing specific insecure or secure patterns).\n3. If NON_COMPLIANT or PARTIALLY_COMPLIANT, provide a secure rewritten snippet for the most critical issue.\n4. Summarize the overall risk as LOW, MEDIUM, or HIGH.\n\nRespond in the following JSON format only:\n{\n  \"status\": \"COMPLIANT|PARTIALLY_COMPLIANT|NON_COMPLIANT\",\n  \"risk\": \"LOW|MEDIUM|HIGH\",\n  \"summary\": \"...\",\n  \"secure_example\": \"...\",\n  \"insecure_example\": \"...\"\n}\n\nHere is the file content:\n\n${content.substring(0, 8000)}`,
    context: results,
  });

  let parsed;
  try {
    parsed = JSON.parse(llmAnswer);
  } catch {
    parsed = {
      status: 'UNKNOWN',
      risk: 'MEDIUM',
      summary: llmAnswer,
      secure_example: '',
      insecure_example: '',
    };
  }

  return {
    source,
    language,
    status: parsed.status,
    risk: parsed.risk,
    summary: parsed.summary,
    secureExample: parsed.secure_example,
    insecureExample: parsed.insecure_example,
    knowledgeSources: results.map((r) => r.source),
  };
};

const detectLanguageFromPath = (filePath) => {
  if (!filePath) return 'all';
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx') || filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    return 'javascript';
  }
  if (filePath.endsWith('.py')) return 'python';
  if (filePath.endsWith('.go')) return 'go';
  if (filePath.endsWith('.java')) return 'java';
  if (filePath.endsWith('.rb')) return 'ruby';
  if (filePath.endsWith('.cs')) return 'csharp';
  return 'all';
};

module.exports = {
  ingestGithubFile,
  listUserRepos,
  getRepoTree,
  analyzeGithubFile,
};


