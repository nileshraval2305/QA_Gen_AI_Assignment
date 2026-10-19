# RAG MongoDB Demo - Backend API

Backend-only API for storing and retrieving test cases with MongoDB Atlas Vector Search.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account with Vector Search enabled
- API keys for Mistral AI and Groq

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `MISTRAL_API_KEY` - Mistral AI API key for embeddings
- `GROQ_API_KEY` - Groq API key for LLM operations
- Database and collection names
- Index names for BM25 and Vector search

### Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3001` (or the PORT specified in .env)

## 📡 API Endpoints

### Health Check
- `GET /api/health` - Check if server is running

### File Management
- `GET /api/files` - List all JSON files in data directory
- `POST /api/upload-excel` - Upload and convert Excel files to JSON

### Embeddings
- `POST /api/create-embeddings` - Create embeddings for selected files
- `POST /api/create-embeddings-batch` - Batch create embeddings (faster)

### Search
- `POST /api/search` - Vector search
- `POST /api/search/bm25` - BM25 keyword search
- `POST /api/search/hybrid` - Hybrid search (BM25 + Vector)
- `POST /api/search/rerank` - Score fusion with reranking

### Query Processing
- `POST /api/search/preprocess` - Preprocess query (normalization, synonyms)
- `POST /api/search/analyze` - Analyze query without applying changes

### Results Processing
- `POST /api/search/deduplicate` - Deduplicate search results
- `POST /api/search/summarize` - Summarize results using AI

### Metadata
- `GET /api/metadata/distinct` - Get distinct values for filters

### Settings
- `GET /api/env` - Get environment variables
- `POST /api/env` - Update environment variables

### Jobs
- `GET /api/jobs/active` - Get active background jobs
- `GET /api/jobs/:jobId` - Get job status

### Testing
- `POST /api/test-prompt` - Test AI prompts

## 🗂️ Project Structure

```
├── server/
│   └── index.js              # Express server and API routes
├── src/
│   ├── config/               # Index configurations
│   ├── data/                 # JSON data files
│   ├── scripts/
│   │   ├── data-conversion/  # Excel to JSON converters
│   │   ├── embeddings/       # Embedding generation scripts
│   │   ├── query-preprocessing/ # Query processing utilities
│   │   ├── search/           # Search implementations
│   │   └── utilities/        # Helper functions
├── uploads/                  # Uploaded files directory
├── releases/                 # Release documentation
├── .env                      # Environment variables (create from .env.example)
├── .env.example              # Environment template
└── package.json              # Dependencies and scripts
```

## 🔧 Backend Technologies

- **Express.js** - Web framework
- **MongoDB Atlas** - Vector database with Atlas Search
- **Mistral AI** - Embedding generation
- **Groq** - LLM operations (summarization, reranking)
- **Multer** - File upload handling
- **XLSX** - Excel file processing

## 📝 Environment Variables

Required variables in `.env`:

```env
# Server
PORT=3001

# MongoDB Atlas
MONGODB_URI=your_mongodb_connection_string
DB_NAME=your_database_name
COLLECTION_NAME=your_collection_name

# Search Indexes
VECTOR_INDEX_NAME=vector_index
BM25_INDEX_NAME=bm25_index

# API Keys
MISTRAL_API_KEY=your_mistral_api_key
GROQ_API_KEY=your_groq_api_key

# Models
GROQ_RERANK_MODEL=llama-3.2-3b-preview
GROQ_SUMMARIZATION_MODEL=llama-3.3-70b-versatile
```

## 🧪 Testing the API

Use curl, Postman, or any HTTP client:

```bash
# Health check
curl http://localhost:3001/api/health

# Vector search
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "login functionality", "limit": 5}'

# BM25 search
curl -X POST http://localhost:3001/api/search/bm25 \
  -H "Content-Type: application/json" \
  -d '{"query": "user authentication", "limit": 5}'
```

## 🚨 Important Notes

- The `client/` folder has been removed - this is now a backend-only API
- Frontend applications should connect to this API via HTTP requests
- CORS is enabled for cross-origin requests
- File uploads are stored in the `uploads/` directory
- Temporary conversion scripts are auto-cleaned after execution

## 📦 Dependencies

All frontend dependencies have been removed. Only backend dependencies remain:
- express
- mongodb
- cors
- multer
- dotenv
- axios
- groq-sdk
- @mistralai/mistralai
- xlsx
- And other backend utilities

## 🔄 Migration from Full-Stack

If you previously had the React frontend:
1. The backend API remains unchanged
2. All routes and functionality are preserved
3. Build a new frontend that consumes these API endpoints
4. Or use API testing tools like Postman for direct interaction

## 📚 Additional Resources

- [MongoDB Atlas Vector Search](https://www.mongodb.com/docs/atlas/atlas-vector-search/)
- [Mistral AI Documentation](https://docs.mistral.ai/)
- [Groq API Documentation](https://console.groq.com/docs)

## 🤝 Support

For issues or questions, refer to the release documentation in the `releases/` folder.
