# CodeShield AI

A private AI-powered knowledge base for secure coding practices in high-security development environments.

## Description

CodeShield AI helps development teams maintain consistent and secure coding standards. Instead of using public AI tools that might suggest vulnerable code, this system provides answers based on your organization's approved security guidelines.

Security leads upload internal security documentation (PDFs, Markdown files), and developers can query the system to get secure code examples that match company standards. The AI automatically warns against deprecated practices like MD5 hashing and provides side-by-side comparisons of secure vs insecure code.

## Key Features

- Upload security standard documents (PDF/Markdown)
- AI-powered semantic search using vector embeddings
- Get secure code snippets with explanations
- Automatic validation against forbidden practices
- Side-by-side secure vs insecure code comparison
- Syntax highlighting for multiple languages
- Filter results by programming language
- Optional GitHub repository vulnerability scanner

## Tech Stack

**Frontend:**
- React.js
- Tailwind CSS
- Axios
- React Router
- React Syntax Highlighter
- Lucide React (icons)

**Backend:**
- Node.js
- Express.js
- MongoDB (with Vector Search)
- Multer (file uploads)
- PDF Parse
- Marked (Markdown parser)

**AI Integration:**
- OpenAI API / Google Gemini API

## Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/codeshield-ai.git
cd codeshield-ai
```

2. Install backend dependencies
```bash
cd server
npm install
```

3. Install frontend dependencies
```bash
cd ../client
npm install
```

4. Create `.env` file in server directory
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/codeshield
OPENAI_API_KEY=your_api_key_here
```

5. Run the application

Backend:
```bash
cd server
npm run dev
```

Frontend:
```bash
cd client
npm start
```

## Usage

1. **Upload Documents**: Security leads upload organizational security standards
2. **Query System**: Developers ask questions like "How do I encrypt JWTs in Node.js?"
3. **Get Results**: Receive secure code snippets with explanations and warnings
4. **Copy & Use**: Implement the secure code in your projects

## Project Structure

```
codeshield-ai/
├── client/          # React frontend
├── server/          # Express backend
└── README.md
```

## License

MIT License