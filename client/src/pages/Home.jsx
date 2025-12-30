import { useState } from 'react';
import {
  Search,
  Code,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Copy,
  Loader2,
  UploadCloud,
  Github,
} from 'lucide-react';

const Home = () => {
  const [query, setQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ask');

  // Upload state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // GitHub integration state
  const [repoUrl, setRepoUrl] = useState('');
  const [filePath, setFilePath] = useState('');
  const [githubStatus, setGithubStatus] = useState(null);
  const [githubLoading, setGithubLoading] = useState(false);
  const [repos, setRepos] = useState([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [tree, setTree] = useState(null);
  const [treeLoading, setTreeLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileAnalysis, setFileAnalysis] = useState(null);
  const [fileAnalysisLoading, setFileAnalysisLoading] = useState(false);

  const languages = [
    { value: 'all', label: 'All Languages' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'go', label: 'Go' },
    { value: 'java', label: 'Java' },
    { value: 'typescript', label: 'TypeScript' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('http://localhost:5000/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          language: selectedLanguage !== 'all' ? selectedLanguage : undefined
        })
      });

      if (!res.ok) throw new Error('Failed to get response');

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err.message || 'Failed to process query');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const CodeBlock = ({ code, language, title, type }) => {
    const bgColor = type === 'secure' 
      ? 'bg-green-900/20 border-green-500/50' 
      : 'bg-red-900/20 border-red-500/50';
    const iconColor = type === 'secure' ? 'text-green-400' : 'text-red-400';
    const Icon = type === 'secure' ? CheckCircle : XCircle;

    return (
      <div className={`${bgColor} border rounded-lg p-6 mb-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${iconColor}`} />
            <h3 className={`text-lg font-semibold ${iconColor}`}>{title}</h3>
          </div>
          <button
            onClick={() => copyToClipboard(code)}
            className="text-gray-400 hover:text-white transition-colors"
            title="Copy code"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <code className={`text-sm text-gray-100`}>{code}</code>
        </pre>
      </div>
    );
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploadLoading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);

      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadStatus({
        type: 'success',
        message: `Ingested ${data.chunksProcessed} chunks from ${data.source}`,
      });
    } catch (err) {
      setUploadStatus({
        type: 'error',
        message: err.message || 'Upload failed',
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleGithubSubmit = async (e) => {
    e.preventDefault();
    if (!repoUrl.trim() || !filePath.trim()) return;

    setGithubLoading(true);
    setGithubStatus(null);

    try {
      const res = await fetch('http://localhost:5000/api/github/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoUrl, filePath }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'GitHub scan failed');
      }

      setGithubStatus({
        type: 'success',
        message: `Ingested ${data.chunksIngested} chunks from ${data.source}`,
      });
    } catch (err) {
      setGithubStatus({
        type: 'error',
        message: err.message || 'GitHub scan failed',
      });
    } finally {
      setGithubLoading(false);
    }
  };

  const fetchRepos = async () => {
    try {
      setReposLoading(true);
      setGithubStatus(null);
      const res = await fetch('http://localhost:5000/api/github/repos');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load repositories');
      setRepos(data.repos || []);
    } catch (err) {
      setGithubStatus({
        type: 'error',
        message: err.message || 'Failed to load repositories',
      });
    } finally {
      setReposLoading(false);
    }
  };

  const fetchTree = async (repo) => {
    try {
      setTreeLoading(true);
      setTree(null);
      setSelectedFile(null);
      setFileAnalysis(null);
      setRepoUrl(repo.htmlUrl);
      const params = new URLSearchParams({ repoUrl: repo.htmlUrl });
      const res = await fetch(`http://localhost:5000/api/github/tree?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load repository tree');
      setTree(data);
    } catch (err) {
      setGithubStatus({
        type: 'error',
        message: err.message || 'Failed to load repository tree',
      });
    } finally {
      setTreeLoading(false);
    }
  };

  const handleFileClick = async (path) => {
    try {
      setSelectedFile(path);
      setFileAnalysis(null);
      setFileAnalysisLoading(true);
      setGithubStatus(null);

      const res = await fetch('http://localhost:5000/api/github/analyze-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoUrl, filePath: path }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze file');

      setFileAnalysis(data);
    } catch (err) {
      setGithubStatus({
        type: 'error',
        message: err.message || 'Failed to analyze file',
      });
    } finally {
      setFileAnalysisLoading(false);
    }
  };

  const renderFileTree = () => {
    if (!tree || !tree.files) return null;

    const byDir = {};
    tree.files.forEach((f) => {
      const parts = f.path.split('/');
      const fileName = parts.pop();
      const dir = parts.join('/') || '/';
      if (!byDir[dir]) byDir[dir] = [];
      byDir[dir].push(fileName);
    });

    const dirs = Object.keys(byDir).sort();

    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm max-h-80 overflow-auto">
        {dirs.map((dir) => (
          <div key={dir} className="mb-2">
            <div className="text-gray-400 font-semibold">{dir}</div>
            <div className="ml-3 space-y-1 mt-1">
              {byDir[dir]
                .sort()
                .map((file) => {
                  const fullPath = dir === '/' ? file : `${dir}/${file}`;
                  const isSelected = selectedFile === fullPath;
                  return (
                    <button
                      key={fullPath}
                      type="button"
                      onClick={() => handleFileClick(fullPath)}
                      className={`w-full text-left px-2 py-1 rounded ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      {file}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4 py-8">
        <div className="flex items-center justify-center gap-3">
          <Shield className="w-12 h-12 text-blue-500" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-500 via-green-400 to-blue-600 bg-clip-text text-transparent">
            CodeShield AI
          </h1>
        </div>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Private, compliance-aware AI assistant that ensures developers write security-approved code 
          using your organization's internal standards
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          type="button"
          onClick={() => setActiveTab('ask')}
          className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${
            activeTab === 'ask'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <Search className="w-4 h-4" />
          Ask Question
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${
            activeTab === 'upload'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          Upload Policy (PDF/MD/TXT)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('github')}
          className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${
            activeTab === 'github'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <Github className="w-4 h-4" />
          GitHub Code Scan
        </button>
      </div>

      {/* Query Input Section */}
      {activeTab === 'ask' && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
          {/* Language Selector */}
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <button
                key={lang.value}
                type="button"
                onClick={() => setSelectedLanguage(lang.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedLanguage === lang.value
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Query Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about secure coding practices... (e.g., 'How should I encrypt JWTs?')"
              className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Get Secure Code</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Upload Section */}
      {activeTab === 'upload' && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl space-y-4">
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div className="border border-dashed border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center gap-3">
              <UploadCloud className="w-8 h-8 text-blue-400" />
              <p className="text-gray-300 text-sm">
                Upload security policies or internal docs as PDF, Markdown (.md), or Text (.txt)
              </p>
              <input
                type="file"
                accept=".pdf,.md,.txt"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="text-sm text-gray-300"
              />
            </div>
            <button
              type="submit"
              disabled={uploadLoading || !uploadFile}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {uploadLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Ingesting document...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-5 h-5" />
                  <span>Upload & Ingest</span>
                </>
              )}
            </button>
          </form>

          {uploadStatus && (
            <div
              className={`rounded-lg p-3 text-sm ${
                uploadStatus.type === 'success'
                  ? 'bg-green-900/20 border border-green-500/50 text-green-300'
                  : 'bg-red-900/20 border border-red-500/50 text-red-300'
              }`}
            >
              {uploadStatus.message}
            </div>
          )}
        </div>
      )}

      {/* GitHub Integration Section */}
      {activeTab === 'github' && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: repo list + tree */}
            <div className="md:w-1/2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  Your GitHub Repositories
                </h3>
                <button
                  type="button"
                  onClick={fetchRepos}
                  disabled={reposLoading}
                  className="px-3 py-1 rounded text-xs font-medium bg-gray-900 text-gray-200 hover:bg-gray-700 disabled:opacity-50"
                >
                  {reposLoading ? 'Loading…' : 'Load Repos'}
                </button>
              </div>
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-2 max-h-40 overflow-auto text-sm">
                {repos.length === 0 && !reposLoading && (
                  <p className="text-gray-500">Click “Load Repos” to fetch your repositories.</p>
                )}
                {repos.map((repo) => (
                  <button
                    key={repo.id}
                    type="button"
                    onClick={() => fetchTree(repo)}
                    className="w-full text-left px-2 py-1 rounded text-gray-200 hover:bg-gray-800"
                  >
                    {repo.fullName}
                    {repo.private && <span className="text-xs text-yellow-400 ml-2">private</span>}
                  </button>
                ))}
              </div>

              <h3 className="text-sm font-semibold text-gray-200 mt-2">Repository Files</h3>
              {treeLoading ? (
                <div className="text-gray-400 text-sm">Loading file tree…</div>
              ) : (
                renderFileTree()
              )}
            </div>

            {/* Right: analysis */}
            <div className="md:w-1/2 space-y-4">
              <h3 className="text-sm font-semibold text-gray-200">File Compliance Analysis</h3>
              {!selectedFile && (
                <p className="text-gray-500 text-sm">
                  Select a file from the tree to analyze it against your security policies.
                </p>
              )}
              {selectedFile && (
                <div className="text-xs text-gray-400 mb-2 break-all">
                  File: <span className="text-gray-200">{selectedFile}</span>
                </div>
              )}
              {fileAnalysisLoading && (
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing file for policy compliance…</span>
                </div>
              )}
              {fileAnalysis && !fileAnalysisLoading && (
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        fileAnalysis.status === 'COMPLIANT'
                          ? 'bg-green-900/40 text-green-300'
                          : fileAnalysis.status === 'PARTIALLY_COMPLIANT'
                          ? 'bg-yellow-900/40 text-yellow-300'
                          : 'bg-red-900/40 text-red-300'
                      }`}
                    >
                      {fileAnalysis.status}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        fileAnalysis.risk === 'LOW'
                          ? 'bg-green-900/30 text-green-300'
                          : fileAnalysis.risk === 'MEDIUM'
                          ? 'bg-yellow-900/30 text-yellow-300'
                          : 'bg-red-900/30 text-red-300'
                      }`}
                    >
                      Risk: {fileAnalysis.risk}
                    </span>
                  </div>
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                    <p className="text-gray-200 whitespace-pre-wrap">
                      {fileAnalysis.summary}
                    </p>
                  </div>
                  {fileAnalysis.insecureExample && (
                    <CodeBlock
                      code={fileAnalysis.insecureExample}
                      title="Detected Insecure Pattern"
                      type="insecure"
                    />
                  )}
                  {fileAnalysis.secureExample && (
                    <CodeBlock
                      code={fileAnalysis.secureExample}
                      title="Suggested Secure Implementation"
                      type="secure"
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {githubStatus && (
            <div
              className={`rounded-lg p-3 text-sm ${
                githubStatus.type === 'success'
                  ? 'bg-green-900/20 border border-green-500/50 text-green-300'
                  : 'bg-red-900/20 border border-red-500/50 text-red-300'
              }`}
            >
              {githubStatus.message}
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Response Display */}
      {response && (
        <div className="space-y-6">
          {/* Secure Code Block */}
          {response.secure_code && (
            <CodeBlock
              code={response.secure_code}
              language={selectedLanguage}
              title="✅ Approved Secure Code"
              type="secure"
            />
          )}

          {/* Explanation */}
          {response.explanation && (
            <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
                <Code className="w-5 h-5" />
                Explanation
              </h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {response.explanation}
              </p>
            </div>
          )}

          {/* Insecure Code Block */}
          {response.insecure_code && (
            <CodeBlock
              code={response.insecure_code}
              language={selectedLanguage}
              title="❌ Don't Do This (Insecure)"
              type="insecure"
            />
          )}

          {/* Why It's Dangerous */}
          {response.danger_reason && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Why This Is Dangerous
              </h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {response.danger_reason}
              </p>
            </div>
          )}

          {/* Validation Warning */}
          {response.is_forbidden && (
            <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                    🚫 Request Rejected
                  </h3>
                  <p className="text-gray-300 mb-3">
                    {response.forbidden_message || 'This practice is forbidden per internal policy.'}
                  </p>
                  {response.approved_alternative && (
                    <div className="mt-4">
                      <p className="text-green-400 font-semibold mb-2">✅ Approved Alternative:</p>
                      <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                        <code className="text-sm text-gray-100">{response.approved_alternative}</code>
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Section */}
      {!response && !loading && activeTab === 'ask' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <Shield className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Security-First</h3>
            <p className="text-gray-400 text-sm">
              All code suggestions are validated against your organization's security policies
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <Code className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Language-Aware</h3>
            <p className="text-gray-400 text-sm">
              Get language-specific secure coding practices for JavaScript, Python, Go, and more
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <CheckCircle className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Compliance-Ready</h3>
            <p className="text-gray-400 text-sm">
              Ensures SOC2, ISO, and HIPAA compliance in every code suggestion
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

