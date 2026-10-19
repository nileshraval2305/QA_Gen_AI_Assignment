# Backend Services - Terminal Commands Guide

## 📋 Project Architecture Overview

Your project has **ONE main backend service** (API server) and **multiple standalone scripts** for data processing.

### Architecture Type
- **Monolithic API Server** - All API endpoints in one Express.js server
- **Standalone Scripts** - Independent Node.js scripts for batch processing
- **No Microservices** - Everything runs through the main API or as standalone scripts

---

## 🚀 Backend Services Breakdown

### 1. Main API Server (Primary Service)

**File:** `server/index.js`

**Purpose:** 
- REST API server handling ALL operations
- File uploads and Excel conversion
- Embedding creation (spawns background jobs)
- Search operations (Vector, BM25, Hybrid)
- Query preprocessing
- Summarization and deduplication
- Job tracking and status monitoring

**Runtime:** Node.js (ES Modules)

**Command:**
```bash
# From project root directory
npm run dev
# OR
npm start
# OR
node server/index.js
```

**Port:** `3001` (default, configurable via `.env`)

**What It Does:**
- Starts Express.js server on port 3001
- Loads environment variables from `.env`
- Connects to MongoDB Atlas
- Exposes REST API endpoints
- Handles file uploads to `uploads/` folder
- Spawns child processes for batch embedding jobs
- Manages in-memory job queue

**Dependencies:**
- Express.js (web framework)
- MongoDB driver
- Multer (file uploads)
- CORS (cross-origin requests)
- Mistral AI SDK (embeddings)
- Groq SDK (LLM operations)

**API Endpoints Provided:**
- `/api/health` - Health check
- `/api/upload-excel` - Upload & convert Excel
- `/api/files` - List JSON files
- `/api/create-embeddings` - Create embeddings (slow)
- `/api/create-embeddings-batch` - Create embeddings (fast)
- `/api/jobs/:jobId` - Job status
- `/api/search` - Vector search
- `/api/search/bm25` - BM25 search
- `/api/search/hybrid` - Hybrid search
- `/api/search/rerank` - Reranked search
- `/api/search/preprocess` - Query preprocessing
- `/api/search/summarize` - AI summarization
- `/api/metadata/distinct` - Get metadata
- `/api/env` - Environment variables
- And more...

---

### 2. Data Conversion Scripts (Standalone)

These scripts convert Excel files to JSON format. They are **standalone** and can run independently.

#### A. Test Cases Conversion

**File:** `src/scripts/data-conversion/excel-to-json.js`

**Purpose:** Convert Excel file with test cases to JSON format

**Runtime:** Node.js (ES Modules)

**Command:**
```bash
# From project root directory
node src/scripts/data-conversion/excel-to-json.js
```

**Configuration (Edit in file):**
```javascript
const excelFile = "src/data/testcases.xlsx";
const sheetName = "testcases";
const outputFile = "src/data/testcases.json";
```

**What It Does:**
1. Reads Excel file from `src/data/testcases.xlsx`
2. Extracts data from specified sheet
3. Maps columns to JSON structure
4. Writes output to `src/data/testcases.json`

**When to Use:**
- When you want to convert Excel files manually
- For testing conversion logic
- When API server is not needed

**Note:** The API server (`/api/upload-excel`) does this automatically, so you typically don't need to run this manually.

---

#### B. User Stories Conversion

**File:** `src/scripts/data-conversion/excel-to-userstories.js`

**Purpose:** Convert Excel file with user stories to JSON format

**Runtime:** Node.js (ES Modules)

**Command:**
```bash
# From project root directory
node src/scripts/data-conversion/excel-to-userstories.js
```

**Configuration (Edit in file):**
```javascript
const excelFile = "src/data/userstories.xlsx";
const sheetName = "stories";
const outputFile = "src/data/stories.json";
```

**What It Does:**
1. Reads Excel file from `src/data/userstories.xlsx`
2. Maps flexible column names to standard fields
3. Transforms to user story format
4. Writes output to `src/data/stories.json`

**When to Use:**
- Manual conversion of user stories
- Testing user story format
- Batch processing without API

---

#### C. Jira Stories Fetcher

**File:** `src/scripts/data-conversion/fetch-jira-stories.js`

**Purpose:** Fetch user stories directly from Jira API

**Runtime:** Node.js (ES Modules)

**Command:**
```bash
# From project root directory
node src/scripts/data-conversion/fetch-jira-stories.js
```

**Configuration:** Requires Jira credentials in `.env`

**What It Does:**
1. Connects to Jira API
2. Fetches user stories based on JQL query
3. Transforms to standard format
4. Saves to JSON file

**When to Use:**
- Direct integration with Jira
- Automated story synchronization
- Bypassing Excel export

---

### 3. Embedding/Ingestion Scripts (Standalone)

These scripts create embeddings and store them in MongoDB. They are **standalone** and run independently.

#### A. Test Cases Embeddings (Batch - RECOMMENDED)

**File:** `src/scripts/embeddings/create-embeddings-batch-mistral.js`

**Purpose:** Create embeddings for test cases using Mistral AI (batch processing)

**Runtime:** Node.js (ES Modules)

**Command:**
```bash
# From project root directory
node src/scripts/embeddings/create-embeddings-batch-mistral.js
```

**Configuration:**
- Reads JSON files from `src/data/` directory
- Uses environment variables from `.env`
- Can specify files via `EMBEDDING_INPUT_FILES` env var

**Environment Variable (Optional):**
```bash
# Process specific files
EMBEDDING_INPUT_FILES="converted-1770988313558.json,converted-1770988313559.json" node src/scripts/embeddings/create-embeddings-batch-mistral.js
```

**What It Does:**
1. Reads test case JSON files from `src/data/`
2. Batches test cases (50 per batch)
3. Generates embeddings using Mistral AI batch API
4. Stores documents with embeddings in MongoDB
5. Shows progress, cost, and token usage

**Performance:**
- **Batch Size:** 50 test cases per batch
- **Concurrent Batches:** 3 simultaneous API calls
- **Speed:** 10-50x faster than single processing
- **150 test cases:** ~2-5 minutes

**When to Use:**
- **ALWAYS** - This is the recommended method
- Fast batch processing
- Production ingestion
- Large datasets

---

#### B. User Stories Embeddings (Batch - RECOMMENDED)

**File:** `src/scripts/embeddings/create-userstories-embeddings-batch-mistral.js`

**Purpose:** Create embeddings for user stories using Mistral AI (batch processing)

**Runtime:** Node.js (ES Modules)

**Command:**
```bash
# From project root directory
node src/scripts/embeddings/create-userstories-embeddings-batch-mistral.js
```

**Configuration:**
- Reads user story JSON files from `src/data/`
- Uses `USER_STORIES_COLLECTION_NAME` from `.env`
- Can specify files via `EMBEDDING_INPUT_FILES` env var

**Environment Variable (Optional):**
```bash
# Process specific files
EMBEDDING_INPUT_FILES="stories-1770988363821.json" node src/scripts/embeddings/create-userstories-embeddings-batch-mistral.js
```

**What It Does:**
1. Reads user story JSON files from `src/data/`
2. Batches user stories (50 per batch)
3. Generates embeddings using Mistral AI
4. Stores in separate collection (user_stories)
5. Shows progress and costs

**Performance:**
- **Batch Size:** 50 user stories per batch
- **Concurrent Batches:** 3 simultaneous API calls
- **Speed:** Very fast batch processing

**When to Use:**
- Processing user stories
- Separate collection from test cases
- Fast batch ingestion

---

### 4. Search Scripts (Standalone - Optional)

These scripts perform searches directly without the API server.

#### A. Vector Search

**File:** `src/scripts/search/search-vector-db.js`

**Purpose:** Perform vector search directly on MongoDB

**Runtime:** Node.js (ES Modules)

**Command:**
```bash
# From project root directory
node src/scripts/search/search-vector-db.js "your search query"

# Example
node src/scripts/search/search-vector-db.js "login tests"
```

**What It Does:**
1. Takes search query as command-line argument
2. Generates embedding for query
3. Performs vector search on MongoDB
4. Displays results in terminal

**When to Use:**
- Quick testing of vector search
- Command-line search interface
- Debugging search results

---

#### B. BM25 Search

**File:** `src/scripts/search/bm25-search.js`

**Purpose:** Perform BM25 keyword search

**Runtime:** Node.js (ES Modules)

**Command:**
```bash
# From project root directory
node src/scripts/search/bm25-search.js "your search query"
```

---

#### C. Hybrid Search

**File:** `src/scripts/search/search-combined-stores.js`

**Purpose:** Combine BM25 and Vector search

**Runtime:** Node.js (ES Modules)

**Command:**
```bash
# From project root directory
node src/scripts/search/search-combined-stores.js "your search query"
```

---

### 5. Utility Scripts (Standalone)

#### A. Delete All Documents

**File:** `src/scripts/utilities/delete-all-documents.js`

**Purpose:** Delete all documents from MongoDB collection

**Runtime:** Node.js (ES Modules)

**Command:**
```bash
# From project root directory
node src/scripts/utilities/delete-all-documents.js
```

**⚠️ WARNING:** This deletes ALL documents from your collection!

---

## 📊 Service Dependencies

### Independent Services
These run completely independently:
- ✅ Data conversion scripts (Excel to JSON)
- ✅ Embedding scripts (can run without API server)
- ✅ Search scripts (can run without API server)
- ✅ Utility scripts

### API Server Dependencies
The API server can:
- ✅ Run independently
- ✅ Spawn embedding scripts as child processes
- ✅ Handle all operations through REST API

### No Service Dependencies
- ❌ No microservices architecture
- ❌ No separate worker services
- ❌ No message queues
- ❌ No service orchestration needed

---

## 🔧 Environment Setup

### Required Files

**1. `.env` file (REQUIRED)**

Create from `.env.example`:
```bash
cp .env.example .env
```

**Required Variables:**
```env
# MongoDB Atlas
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/"
DB_NAME="db_stories_tests"
COLLECTION_NAME="test_cases"
VECTOR_INDEX_NAME="vector_index_test_cases"
BM25_INDEX_NAME="bm25_search"

# User Stories (if using)
USER_STORIES_COLLECTION_NAME="user_stories"
USER_STORIES_VECTOR_INDEX_NAME="vector_index_user_story"

# Mistral AI (for embeddings)
MISTRAL_API_KEY="your_mistral_api_key_here"
MISTRAL_EMBEDDING_MODEL="mistral-embed"

# Groq AI (for LLM operations)
GROQ_API_KEY="your_groq_api_key_here"
GROQ_RERANK_MODEL="llama-3.2-3b-preview"
GROQ_SUMMARIZATION_MODEL="llama-3.3-70b-versatile"

# Server Port (optional)
PORT=3001
```

### Install Dependencies

```bash
# From project root directory
npm install
```

**Dependencies Installed:**
- express (API server)
- mongodb (database driver)
- @mistralai/mistralai (embeddings)
- groq-sdk (LLM operations)
- multer (file uploads)
- xlsx (Excel processing)
- cors (CORS support)
- dotenv (environment variables)
- axios (HTTP client)
- p-limit (concurrency control)

---

## 🎯 Complete Workflow Commands

### Workflow 1: Using API Server (RECOMMENDED)

**Step 1: Start API Server**
```bash
npm run dev
```
Server starts on http://localhost:3001

**Step 2: Use Postman or curl**
```bash
# Upload Excel
curl -X POST http://localhost:3001/api/upload-excel \
  -F "file=@testcases.xlsx" \
  -F "dataType=testcases"

# Create embeddings (batch)
curl -X POST http://localhost:3001/api/create-embeddings-batch \
  -H "Content-Type: application/json" \
  -d '{
    "files": ["converted-1770988313558.json"],
    "scriptName": "create-embeddings-batch-mistral.js",
    "jobType": "testcases"
  }'

# Check job status
curl http://localhost:3001/api/jobs/job-1770988400000-abc123

# Search
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "login tests", "limit": 5}'
```

---

### Workflow 2: Using Standalone Scripts

**Step 1: Convert Excel to JSON**
```bash
# Edit the file to set input/output paths
node src/scripts/data-conversion/excel-to-json.js
```

**Step 2: Create Embeddings**
```bash
# Batch processing (fast)
node src/scripts/embeddings/create-embeddings-batch-mistral.js
```

**Step 3: Search (Optional)**
```bash
# Vector search
node src/scripts/search/search-vector-db.js "login tests"
```

---

### Workflow 3: Hybrid Approach

**Step 1: Use standalone script for conversion**
```bash
node src/scripts/data-conversion/excel-to-json.js
```

**Step 2: Use API for embeddings**
```bash
# Start API server
npm run dev

# Use Postman to call /api/create-embeddings-batch
```

**Step 3: Use API for search**
```bash
# Use Postman to call /api/search
```

---

## 📁 Directory Structure

```
project-root/
├── server/
│   └── index.js              ← Main API Server (START HERE)
├── src/
│   ├── data/                 ← JSON files and Excel files
│   ├── config/               ← Index configurations
│   └── scripts/
│       ├── data-conversion/  ← Excel to JSON scripts
│       │   ├── excel-to-json.js
│       │   ├── excel-to-userstories.js
│       │   └── fetch-jira-stories.js
│       ├── embeddings/       ← Embedding creation scripts
│       │   ├── create-embeddings-batch-mistral.js
│       │   └── create-userstories-embeddings-batch-mistral.js
│       ├── search/           ← Search scripts
│       │   ├── search-vector-db.js
│       │   ├── bm25-search.js
│       │   └── search-combined-stores.js
│       └── utilities/        ← Helper utilities
│           ├── mistralEmbedding.js
│           ├── groqClient.js
│           └── delete-all-documents.js
├── uploads/                  ← Temporary file uploads
├── .env                      ← Environment variables (CREATE THIS)
├── .env.example              ← Environment template
└── package.json              ← Dependencies and scripts
```

---

## 🚦 Startup Order

### No Specific Order Required!

All services are independent:
- ✅ API server can start anytime
- ✅ Scripts can run anytime
- ✅ No dependencies between services

### Recommended Order (for full workflow):

1. **Start API Server** (if using API)
   ```bash
   npm run dev
   ```

2. **Run conversion scripts** (if needed)
   ```bash
   node src/scripts/data-conversion/excel-to-json.js
   ```

3. **Run embedding scripts** (if needed)
   ```bash
   node src/scripts/embeddings/create-embeddings-batch-mistral.js
   ```

4. **Use search** (via API or scripts)
   ```bash
   # Via API
   curl http://localhost:3001/api/search
   
   # Or via script
   node src/scripts/search/search-vector-db.js "query"
   ```

---

## 🔌 Required Ports

| Service | Port | Configurable | Notes |
|---------|------|--------------|-------|
| API Server | 3001 | Yes (via `.env`) | Main REST API |
| MongoDB Atlas | 27017 | N/A | Cloud-hosted |

**No other ports required!**

---

## ✅ Pre-Flight Checklist

Before running any backend service:

### Environment
- [ ] `.env` file created and configured
- [ ] `MONGODB_URI` set with valid connection string
- [ ] `MISTRAL_API_KEY` set with valid API key
- [ ] `GROQ_API_KEY` set with valid API key
- [ ] Database and collection names configured

### MongoDB Atlas
- [ ] Cluster accessible
- [ ] Database created
- [ ] Collection created
- [ ] Vector Search index created (`vector_index_test_cases`)
- [ ] BM25 Search index created (`bm25_search`)

### Dependencies
- [ ] Node.js installed (v16+)
- [ ] npm dependencies installed (`npm install`)

### Data Files (if using standalone scripts)
- [ ] Excel files in `src/data/` folder
- [ ] JSON files in `src/data/` folder (after conversion)

---

## 🎯 Quick Command Reference

### Start API Server
```bash
npm run dev
```

### Convert Excel to JSON (Test Cases)
```bash
node src/scripts/data-conversion/excel-to-json.js
```

### Convert Excel to JSON (User Stories)
```bash
node src/scripts/data-conversion/excel-to-userstories.js
```

### Create Embeddings (Test Cases - Batch)
```bash
node src/scripts/embeddings/create-embeddings-batch-mistral.js
```

### Create Embeddings (User Stories - Batch)
```bash
node src/scripts/embeddings/create-userstories-embeddings-batch-mistral.js
```

### Search (Vector)
```bash
node src/scripts/search/search-vector-db.js "your query"
```

### Delete All Documents (⚠️ DANGEROUS)
```bash
node src/scripts/utilities/delete-all-documents.js
```

---

## 🐛 Troubleshooting

### "Cannot find module"
**Solution:** Run `npm install` from project root

### "MONGODB_URI is not defined"
**Solution:** Create `.env` file with MongoDB connection string

### "Port 3001 already in use"
**Solution:** 
```bash
# Find process
Get-NetTCPConnection -LocalPort 3001

# Kill process
Stop-Process -Id <PID> -Force
```

### "Failed to generate embedding"
**Solution:** Verify `MISTRAL_API_KEY` in `.env`

### "Database not found"
**Solution:** Check `DB_NAME` and `COLLECTION_NAME` in `.env`

### "Search index not found"
**Solution:** Create Vector Search indexes in MongoDB Atlas

---

## 📝 Summary

### Main Backend Service
**ONE service:** API Server (`server/index.js`)
- Handles ALL API operations
- Runs on port 3001
- Command: `npm run dev`

### Standalone Scripts
**Multiple scripts** for batch processing:
- Data conversion (Excel → JSON)
- Embedding creation (JSON → MongoDB with embeddings)
- Search operations (direct MongoDB queries)
- Utilities (delete, test, etc.)

### No Microservices
- No separate worker services
- No message queues
- No service orchestration
- Everything runs independently

### Recommended Approach
**Use the API Server** for everything:
- Upload Excel via API
- Create embeddings via API (spawns scripts)
- Search via API
- Monitor jobs via API

**Use standalone scripts** only for:
- Manual batch processing
- Testing
- Debugging
- Direct database operations

---

**Last Updated:** 2026-05-07  
**Version:** 1.0.0  
**Architecture:** Monolithic API + Standalone Scripts
