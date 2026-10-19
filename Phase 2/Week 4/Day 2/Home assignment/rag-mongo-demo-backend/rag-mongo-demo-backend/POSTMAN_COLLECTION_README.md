# Postman Collection - Complete Package

## 📦 What You Have

I've created a complete Postman collection package for data ingestion into your RAG MongoDB system.

### Files Created

1. **`postman_collection_ingestion.json`** - The Postman collection file
2. **`POSTMAN_INGESTION_GUIDE.md`** - Complete step-by-step guide (30+ pages)
3. **`INGESTION_QUICK_REFERENCE.md`** - Quick reference card (cheat sheet)
4. **`EXCEL_TEMPLATE_GUIDE.md`** - Excel file preparation guide

## 🚀 Quick Start (3 Steps)

### Step 1: Import Collection
1. Open Postman
2. Click **Import**
3. Select `postman_collection_ingestion.json`
4. Collection appears in sidebar

### Step 2: Prepare Excel File
- **Test Cases:** Use columns from `EXCEL_TEMPLATE_GUIDE.md`
- **User Stories:** Use flexible column names (auto-mapped)

### Step 3: Run Workflow
1. Health Check → Verify server
2. Upload Excel → Get JSON file
3. Create Embeddings (Batch) → Get job ID
4. Check Job Status → Monitor progress
5. Verify Metadata → Confirm success

## 📋 Collection Contents

### 7 API Requests Included

| # | Request Name | Method | Purpose |
|---|-------------|--------|---------|
| 1 | Health Check | GET | Verify server is running |
| 2 | Upload Excel - Test Cases | POST | Upload test cases Excel |
| 2 | Upload Excel - User Stories | POST | Upload user stories Excel |
| 3 | List Available Files | GET | See converted JSON files |
| 4 | Create Embeddings (Single) | POST | Slow processing |
| 4 | Create Embeddings - Batch (Test Cases) | POST | Fast processing ⚡ |
| 4 | Create Embeddings - Batch (User Stories) | POST | Fast processing ⚡ |
| 5 | Check Job Status | GET | Monitor progress |
| 6 | Get Active Jobs | GET | List all jobs |
| 7 | Get Metadata | GET | Verify ingestion |

### Features

✅ **Auto-populated variables** - jobId and outputFile set automatically  
✅ **Pre-configured requests** - Ready to use out of the box  
✅ **Detailed descriptions** - Each request has full documentation  
✅ **Test scripts** - Automatic variable extraction  
✅ **Example bodies** - Sample JSON for all requests  

## 🎯 Complete Workflow Example

### Scenario: Ingest 150 Test Cases

```
1. Health Check
   GET /api/health
   → Status: 200 OK ✅

2. Upload Excel
   POST /api/upload-excel
   Body: file=testcases.xlsx, dataType=testcases
   → outputFile: "converted-1770988313558.json" ✅

3. Create Embeddings (Batch)
   POST /api/create-embeddings-batch
   Body: {
     "files": ["converted-1770988313558.json"],
     "scriptName": "create-embeddings-batch-mistral.js",
     "jobType": "testcases"
   }
   → jobId: "job-1770988400000-abc123" ✅

4. Monitor Progress (Poll every 10 seconds)
   GET /api/jobs/job-1770988400000-abc123
   → status: "in-progress" → "completed" ✅

5. Verify Success
   GET /api/metadata/distinct
   → modules: ["Login", "Dashboard", ...] ✅

Result: 150 test cases with embeddings in MongoDB! 🎉
```

## 📚 Documentation Guide

### For Quick Reference
→ Read **`INGESTION_QUICK_REFERENCE.md`**
- One-page cheat sheet
- All endpoints at a glance
- Common issues & solutions
- Performance guide

### For Complete Guide
→ Read **`POSTMAN_INGESTION_GUIDE.md`**
- Detailed step-by-step instructions
- Request/response examples
- Troubleshooting section
- Best practices
- Performance expectations

### For Excel Preparation
→ Read **`EXCEL_TEMPLATE_GUIDE.md`**
- Required columns for test cases
- Flexible columns for user stories
- Sample data
- Validation checklist
- Common mistakes to avoid

## 🔧 Configuration

### Collection Variables

The collection uses 3 variables:

| Variable | Default | Auto-Set | Description |
|----------|---------|----------|-------------|
| `baseUrl` | `http://localhost:3001` | No | Backend server URL |
| `outputFile` | (empty) | Yes | JSON filename after upload |
| `jobId` | (empty) | Yes | Job ID after starting embeddings |

### Change Base URL

If your server runs on a different port:

1. Right-click collection → **Edit**
2. Go to **Variables** tab
3. Change `baseUrl` to your URL
4. Click **Save**

## ⚡ Performance Guide

### Batch vs Single Processing

| Documents | Single | Batch | Recommendation |
|-----------|--------|-------|----------------|
| 50 | 5-10 min | 30-60 sec | Use Batch ⚡ |
| 150 | 15-30 min | 2-5 min | Use Batch ⚡ |
| 500 | 50-100 min | 5-15 min | Use Batch ⚡ |
| 1000+ | ❌ Too slow | 15-30 min | Use Batch ⚡ |

**Always use batch processing for better performance!**

## 🎨 Request Details

### 1. Health Check
```http
GET {{baseUrl}}/api/health
```
**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

### 2. Upload Excel
```http
POST {{baseUrl}}/api/upload-excel
Content-Type: multipart/form-data

file: [Excel file]
dataType: testcases | userstories
sheetName: [Sheet name] (optional)
```
**Response:**
```json
{
  "success": true,
  "outputFile": "converted-1770988313558.json"
}
```

### 3. List Files
```http
GET {{baseUrl}}/api/files
```
**Response:**
```json
[
  {
    "name": "converted-1770988313558.json",
    "size": 245678,
    "modified": "2026-05-07T10:30:00.000Z"
  }
]
```

### 4. Create Embeddings (Batch)
```http
POST {{baseUrl}}/api/create-embeddings-batch
Content-Type: application/json

{
  "files": ["converted-1770988313558.json"],
  "scriptName": "create-embeddings-batch-mistral.js",
  "jobType": "testcases"
}
```
**Response:**
```json
{
  "success": true,
  "jobId": "job-1770988400000-abc123"
}
```

### 5. Check Job Status
```http
GET {{baseUrl}}/api/jobs/{{jobId}}
```
**Response:**
```json
{
  "id": "job-1770988400000-abc123",
  "status": "completed",
  "results": [...]
}
```

### 6. Get Active Jobs
```http
GET {{baseUrl}}/api/jobs/active
```
**Response:**
```json
{
  "jobs": [...]
}
```

### 7. Verify Metadata
```http
GET {{baseUrl}}/api/metadata/distinct
```
**Response:**
```json
{
  "success": true,
  "metadata": {
    "modules": ["Login", "Dashboard"],
    "priorities": ["High", "Medium", "Low"]
  }
}
```

## 🔐 Prerequisites

Before using the collection:

### Backend Server
- [ ] Server running: `npm run dev`
- [ ] Port 3001 accessible
- [ ] Health endpoint responding

### Environment Configuration
- [ ] `.env` file configured
- [ ] `MONGODB_URI` set
- [ ] `MISTRAL_API_KEY` set
- [ ] `DB_NAME` and `COLLECTION_NAME` set

### MongoDB Atlas
- [ ] Cluster accessible
- [ ] Database created
- [ ] Collection created
- [ ] Vector Search indexes created

### Excel File
- [ ] File prepared with correct columns
- [ ] Saved as `.xlsx` format
- [ ] Data validated

## 🚨 Common Issues

### "Connection refused"
**Solution:** Ensure backend server is running on correct port

### "No file uploaded"
**Solution:** Use form-data body type, select file (don't type path)

### "Database not found"
**Solution:** Check `.env` file has correct `DB_NAME`

### "Failed to generate embedding"
**Solution:** Verify `MISTRAL_API_KEY` in `.env` is valid

### "Search index not found"
**Solution:** Create Vector Search indexes in MongoDB Atlas

### Job stuck at "in-progress"
**Solution:** Check server logs, verify MongoDB connection, restart if needed

## 💡 Pro Tips

1. **Use Batch Processing** - Always use batch endpoints (10-50x faster)
2. **Monitor Jobs** - Poll job status until completion
3. **Verify Success** - Always check metadata endpoint after ingestion
4. **Save Job IDs** - Keep track for troubleshooting
5. **Check Costs** - Monitor token usage in job results
6. **Use Correct Script** - Test cases vs user stories have different scripts
7. **Poll Intelligently** - 5-10 sec for small datasets, 30-60 sec for large

## 📊 Cost Estimation

### Mistral AI Pricing
- **Embeddings:** $0.10 per 1M tokens
- **Average test case:** ~150-200 tokens
- **150 test cases:** ~$0.002-0.003
- **1000 test cases:** ~$0.015-0.020

### Batch Advantages
- Lower cost (fewer API calls)
- Faster processing
- Better error handling

## ✅ Success Checklist

After running the workflow:

- [ ] Upload returned outputFile name
- [ ] Embeddings returned jobId
- [ ] Job status shows "completed"
- [ ] No errors in job results
- [ ] Metadata returns populated arrays
- [ ] MongoDB collection has documents
- [ ] Documents have "embedding" field

**If all checked → You're ready to search!** 🚀

## 📞 Support & Resources

### Documentation Files
- **Quick Reference:** `INGESTION_QUICK_REFERENCE.md`
- **Complete Guide:** `POSTMAN_INGESTION_GUIDE.md`
- **Excel Guide:** `EXCEL_TEMPLATE_GUIDE.md`
- **API Docs:** `README.md` (in project root)

### External Resources
- [MongoDB Atlas Vector Search](https://www.mongodb.com/docs/atlas/atlas-vector-search/)
- [Mistral AI Documentation](https://docs.mistral.ai/)
- [Postman Learning Center](https://learning.postman.com/)

### Troubleshooting
1. Check server logs in terminal
2. Verify `.env` configuration
3. Test MongoDB connection
4. Validate API keys
5. Review Excel file format

## 🎉 What's Next?

After successful ingestion:

1. **Search Operations** - Use search endpoints to query data
2. **Query Preprocessing** - Enhance queries with synonyms
3. **Hybrid Search** - Combine BM25 and Vector search
4. **AI Summarization** - Summarize search results
5. **Build Frontend** - Create UI to consume the API

## 📝 Version History

- **v1.0.0** (2026-05-07)
  - Initial release
  - 7 ingestion endpoints
  - Auto-populated variables
  - Complete documentation

---

## 🎯 Summary

You now have:
- ✅ Complete Postman collection for data ingestion
- ✅ 30+ pages of documentation
- ✅ Quick reference guide
- ✅ Excel template guide
- ✅ Ready-to-use API requests
- ✅ Automatic variable management
- ✅ Best practices and troubleshooting

**Import the collection and start ingesting data in minutes!** 🚀

---

**Collection:** RAG MongoDB - Data Ingestion  
**Version:** 1.0.0  
**Created:** 2026-05-07  
**Format:** Postman Collection v2.1.0
