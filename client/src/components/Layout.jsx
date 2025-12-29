import React from 'react';
import { Shield, Github } from 'lucide-react';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  CodeShield AI
                </h1>
                <p className="text-sm text-gray-600">
                  Secure Coding Knowledge Base
                </p>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="flex items-center space-x-6">
              
                href="/"
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Home
              </a>
              
                href="#docs"
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Documents
              </a>
              
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
              >
                <Github className="w-5 h-5" />
                <span>GitHub</span>
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* About */}
            <div>
              <h3 className="text-lg font-semibold mb-4">About CodeShield AI</h3>
              <p className="text-gray-400 text-sm">
                A private knowledge base for secure coding practices in high-security
                development environments.
              </p>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>• AI-Powered Code Generation</li>
                <li>• Security Validation</li>
                <li>• Document Management</li>
                <li>• GitHub Integration</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-gray-400 text-sm">
                Built for secure development teams
              </p>
              <p className="text-gray-400 text-sm mt-2">
                © 2024 CodeShield AI
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;