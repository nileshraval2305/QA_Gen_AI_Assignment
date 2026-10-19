# Backend Services - Quick Command Reference

## 🚀 Main Backend Service

### API Server (Primary - Use This!)
```bash
# Start the API server
npm run dev
# OR
npm start
# OR
node server/index.js
```
- **File:** `server/index.js`
- **Port:** 3001
- **Purpose:** REST API for all operations
- **URL:** http://localhost:3001

---

## 📊 Standalone Scripts (Optional)

### Data Conversion

#### Test Cases (Excel → JSON)
```bash
node src/scripts/data-conversion/excel-to-json.js
```
- **Input:** `src/data/testcases.xlsx`
- **Output:** `src/data/testcases.json`
- **Edit file to change paths**

#### User Stories (Excel → JSON)
```bash
node src/scripts/data-conversion/excel-to-userstories.js
```
- **Input:** `src/data/userstories.xlsx`
- **Output:** `src/data/stories.json`
- **Edit file to change paths**

#### Fetch from Jira
```bash
node src/scripts/data-conversion/fetch-jira-stories.js
```
- **Requires:** Jira credentials in `.env`

---

### Embedding Creation (Batch - Fast ⚡)

#### Test Cases Embeddings
```bash
node src/scripts/embeddings/create-embeddings-batch-mistral.js
```
- **Input:** JSON files in `src/data/`
- **Output:** MongoDB with embeddings
- **Speed:** 150 test cases in 2-5 minutes

#### User Stories Embeddings
```bash
node src/scripts/embeddings/create-userstories-embeddings-batch-mistral.js
```
- **Input:** JSON files in `src/data/`
- **Output:** MongoDB (user_stories collection)
- **Speed:** Very fast batch processing

#### Specify Files (Optional)
```bash
EMBEDDING_INPUT_FILES="file1.json,file2.json" node src/scripts/embeddings/create-embeddings-batch-mistral.js
```

---

### Search Scripts

#### Vector Search
```bash
node src/scripts/search/search-vector-db.js "your search query"
```
**Example:**
```bash
node src/scripts/search/search-vector-db.js "login tests"
```

#### BM25 Search
```bash
node src/scripts/search/bm25-search.js "your search query"
```

#### Hybrid Search
```bash
node src/scripts/search/search-combined-stores.js "your search query"
```

---

### Utilities

#### Delete All Documents (⚠️ DANGEROUS)
```bash
node src/scripts/utilities/delete-all-documents.js
```

---

## 🔧 Setup Commands

### First Time Setup
```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env

# 3. Edit .env with your credentials
# (Use your text editor)

# 4. Start API server
npm run dev
```

---

## 📋 Environment Variables Required

Create `.env` file with:
```env
MONGODB_URI="mongodb+srv://..."
DB_NAME="db_stories_tests"
COLLECTION_NAME="test_cases"
VECTOR_INDEX_NAME="vector_index_test_cases"
BM25_INDEX_NAME="bm25_search"
MISTRAL_API_KEY="your_key"
GROQ_API_KEY="your_key"
PORT=3001
```

---

## 🎯 Recommended Workflow

### Option 1: Use API Server (Easiest)
```bash
# 1. Start server
npm run dev

# 2. Use Postman or curl
curl http://localhost:3001/api/health

# 3. Upload Excel via API
# 4. Create embeddings via API
# 5. Search via API
```

### Option 2: Use Standalone Scripts
```bash
# 1. Convert Excel
node src/scripts/data-conversion/excel-to-json.js

# 2. Create embeddings
node src/scripts/embeddings/create-embeddings-batch-mistral.js

# 3. Search
node src/scripts/search/search-vector-db.js "query"
```

---

## 🚦 Service Status

### Check if API Server is Running
```bash
curl http://localhost:3001/api/health
```
**Expected:** `{"status":"OK","message":"Server is running"}`

### Check Port Usage
```bash
# Windows PowerShell
Get-NetTCPConnection -LocalPort 3001
```

### Kill Process on Port
```bash
# Windows PowerShell
Stop-Process -Id <PID> -Force
```

---

## 📁 Directory Navigation

### Always Run from Project Root
```bash
# Good ✅
cd /path/to/rag-mongo-demo-v8
npm run dev

# Bad ❌
cd server
npm run dev  # Won't work!
```

---

## 🔌 Ports Used

| Service | Port | Configurable |
|---------|------|--------------|
| API Server | 3001 | Yes (`.env`) |
| MongoDB | 27017 | Cloud-hosted |

---

## ⚡ Performance Guide

### Batch Processing (Recommended)
- **50 docs:** 30-60 seconds
- **150 docs:** 2-5 minutes
- **500 docs:** 5-15 minutes
- **1000+ docs:** 15-30 minutes

### Single Processing (Not Recommended)
- **50 docs:** 5-10 minutes
- **150 docs:** 15-30 minutes
- **500 docs:** 50-100 minutes

**Always use batch scripts!**

---

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot find module" | `npm install` |
| "Port already in use" | Kill process on port 3001 |
| "MONGODB_URI not defined" | Create `.env` file |
| "Failed to generate embedding" | Check `MISTRAL_API_KEY` |
| "Database not found" | Check `.env` DB_NAME |
| "Search index not found" | Create indexes in MongoDB Atlas |

---

## 📊 Service Architecture

```
┌─────────────────────────────────────┐
│     API Server (server/index.js)    │
│         Port 3001                   │
│  ✅ Use this for everything         │
└─────────────────────────────────────┘
              │
              ├─ Handles file uploads
              ├─ Converts Excel to JSON
              ├─ Spawns embedding scripts
              ├─ Performs searches
              └─ Manages jobs

┌─────────────────────────────────────┐
│   Standalone Scripts (Optional)     │
│   Run independently                 │
└─────────────────────────────────────┘
              │
              ├─ Data conversion
              ├─ Embedding creation
              ├─ Direct searches
              └─ Utilities
```

---

## ✅ Pre-Flight Checklist

Before running backend:
- [ ] `.env` file created
- [ ] MongoDB URI configured
- [ ] API keys added (Mistral, Groq)
- [ ] `npm install` completed
- [ ] MongoDB Atlas accessible
- [ ] Vector indexes created

---

## 🎯 Most Common Commands

```bash
# Start API server (most common)
npm run dev

# Create embeddings (batch - fast)
node src/scripts/embeddings/create-embeddings-batch-mistral.js

# Search
node src/scripts/search/search-vector-db.js "query"

# Check health
curl http://localhost:3001/api/health
```

---

## 📝 Key Points

1. **ONE main service:** API Server on port 3001
2. **Multiple scripts:** Run independently for batch processing
3. **No microservices:** Everything is standalone
4. **Recommended:** Use API server for everything
5. **Scripts:** Use only for manual batch operations
6. **No startup order:** All services are independent
7. **Runtime:** Node.js (ES Modules)
8. **No Python/uvicorn:** Pure Node.js project

---

**Quick Start:**
```bash
npm run dev
```
**That's it!** 🚀

---

**Version:** 1.0.0  
**Last Updated:** 2026-05-07
