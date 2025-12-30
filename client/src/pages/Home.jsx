import { useState } from 'react';
import { Search, Code, Shield, AlertTriangle, CheckCircle, XCircle, Copy, Loader2 } from 'lucide-react';

const Home = () => {
  const [query, setQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

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

      {/* Query Input Section */}
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
      {!response && !loading && (
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

