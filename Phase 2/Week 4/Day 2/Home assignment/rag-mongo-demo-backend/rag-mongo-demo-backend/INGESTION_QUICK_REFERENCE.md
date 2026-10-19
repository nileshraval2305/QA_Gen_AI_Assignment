# Data Ingestion - Quick Reference Card

## 🚀 3-Step Ingestion Process

### Step 1: Upload Excel → JSON
```http
POST /api/upload-excel
Content-Type: multipart/form-data

file: testcases.xlsx
dataType: testcases (or userstories)
sheetName: Testcases (optional)
```

### Step 2: Create Embeddings (Batch - Fast)
```http
POST /api/create-embeddings-batch
Content-Type: application/json

{
  "files": ["converted-1770988313558.json"],
  "scriptName": "create-embeddings-batch-mistral.js",
  "jobType": "testcases"
}
```

### Step 3: Verify Success
```http
GET /api/metadata/distinct
```

---

## 📋 All Ingestion Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Check server status |
| `/api/upload-excel` | POST | Upload & convert Excel |
| `/api/files` | GET | List available JSON files |
| `/api/create-embeddings` | POST | Create embeddings (slow) |
| `/api/create-embeddings-batch` | POST | Create embeddings (fast) ⚡ |
| `/api/jobs/:jobId` | GET | Check job status |
| `/api/jobs/active` | GET | List active jobs |
| `/api/metadata/distinct` | GET | Verify ingestion |

---

## 📤 Upload Excel - Request Bodies

### Test Cases
```json
{
  "file": "testcases.xlsx",
  "dataType": "testcases",
  "sheetName": "Testcases"
}
```

### User Stories
```json
{
  "file": "userstories.xlsx",
  "dataType": "userstories",
  "sheetName": "stories"
}
```

---

## 🧠 Create Embeddings - Request Bodies

### Batch - Test Cases (Recommended)
```json
{
  "files": ["converted-1770988313558.json"],
  "scriptName": "create-embeddings-batch-mistral.js",
  "jobType": "testcases"
}
```

### Batch - User Stories (Recommended)
```json
{
  "files": ["stories-1770988363821.json"],
  "scriptName": "create-userstories-embeddings-batch-mistral.js",
  "jobType": "userstories"
}
```

### Single File (Slow - Not Recommended)
```json
{
  "files": ["converted-1770988313558.json"]
}
```

---

## 📊 Response Examples

### Upload Success
```json
{
  "success": true,
  "message": "Test cases file converted successfully",
  "outputFile": "converted-1770988313558.json"
}
```

### Embeddings Started
```json
{
  "success": true,
  "jobId": "job-1770988400000-abc123",
  "message": "Batch embedding creation started",
  "filesCount": 1
}
```

### Job In Progress
```json
{
  "id": "job-1770988400000-abc123",
  "status": "in-progress",
  "progress": 0,
  "total": 1,
  "currentFile": "testcases",
  "message": "Processing batch 3/10..."
}
```

### Job Completed
```json
{
  "id": "job-1770988400000-abc123",
  "status": "completed",
  "results": [{
    "file": "testcases",
    "status": "completed",
    "output": "✅ Processed: 150/150"
  }]
}
```

### Metadata (Success)
```json
{
  "success": true,
  "metadata": {
    "modules": ["Login", "Dashboard"],
    "priorities": ["High", "Medium", "Low"],
    "risks": ["High", "Medium", "Low"],
    "types": ["Automated", "Manual"]
  }
}
```

---

## ⏱️ Performance Guide

| Documents | Single Processing | Batch Processing |
|-----------|------------------|------------------|
| 50 | 5-10 min | 30-60 sec ⚡ |
| 150 | 15-30 min | 2-5 min ⚡ |
| 500 | 50-100 min | 5-15 min ⚡ |
| 1000+ | Not recommended | 15-30 min ⚡ |

**Always use batch processing!**

---

## 🔧 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "No file uploaded" | Use form-data, not JSON |
| "Database not found" | Check `.env` DB_NAME |
| "Failed to generate embedding" | Verify MISTRAL_API_KEY |
| "Search index not found" | Create indexes in MongoDB Atlas |
| Job stuck | Check server logs, restart if needed |
| "Collection is empty" | Wait for job completion, check status |

---

## 📝 Excel Column Requirements

### Test Cases
Required columns:
- `module`
- `testCaseId`
- `title`
- `description`
- `steps`
- `expectedResults`
- `priority`
- `automationManual`
- `risk`

### User Stories
Flexible column names (auto-mapped):
- Story ID: `storyId`, `Story Key`, `ID`, `Key`
- Summary: `summary`, `Summary`, `Title`
- Description: `description`, `Description`
- Priority: `priority`, `Priority`
- Status: `status`, `Status`
- And many more...

---

## 🎯 Workflow Checklist

### Before Starting
- [ ] Server running: `npm run dev`
- [ ] `.env` configured
- [ ] MongoDB Atlas accessible
- [ ] Vector indexes created
- [ ] Mistral API key valid
- [ ] Excel file ready

### During Ingestion
- [ ] Upload Excel → Get outputFile
- [ ] Start batch embeddings → Get jobId
- [ ] Poll job status until "completed"
- [ ] Check for errors in results

### After Completion
- [ ] Verify metadata endpoint
- [ ] Check MongoDB collection
- [ ] Confirm embeddings exist
- [ ] Ready for search!

---

## 💰 Cost Estimation

### Mistral AI Pricing
- **Embeddings:** $0.10 per 1M tokens
- **Average test case:** ~150-200 tokens
- **150 test cases:** ~$0.002-0.003
- **1000 test cases:** ~$0.015-0.020

### Batch vs Single
- **Batch:** Lower cost (fewer API calls)
- **Single:** Higher cost (more API calls)

---

## 🔐 Environment Variables

Required in `.env`:
```env
PORT=3001
MONGODB_URI=mongodb+srv://...
DB_NAME=your_database
COLLECTION_NAME=your_collection
VECTOR_INDEX_NAME=vector_index
BM25_INDEX_NAME=bm25_index
MISTRAL_API_KEY=your_mistral_key
```

---

## 📞 Quick Help

### Server Not Starting
```bash
# Check if port is in use
Get-NetTCPConnection -LocalPort 3001

# Kill process
Stop-Process -Id <PID> -Force

# Restart
npm run dev
```

### Test Connection
```bash
curl http://localhost:3001/api/health
```

### View Logs
Check terminal where `npm run dev` is running

---

## 📚 Files Created

After ingestion, you'll have:
- `uploads/` - Temporary Excel files (auto-cleaned)
- `src/data/converted-*.json` - Test cases JSON
- `src/data/stories-*.json` - User stories JSON
- MongoDB collection with embeddings

---

## ⚡ Pro Tips

1. **Always use batch processing** - 10-50x faster
2. **Monitor job status** - Don't assume success
3. **Verify with metadata** - Confirm ingestion worked
4. **Save job IDs** - For troubleshooting
5. **Check costs** - Monitor token usage
6. **Use correct script** - Test cases vs user stories
7. **Poll intelligently** - 5-10 sec for small, 30-60 sec for large

---

## 🎉 Success Indicators

✅ Upload returns outputFile name  
✅ Embeddings return jobId  
✅ Job status shows "completed"  
✅ Metadata returns populated arrays  
✅ MongoDB collection has documents  
✅ Documents have "embedding" field  

**You're ready to search!** 🚀

---

**Quick Reference Version:** 1.0.0  
**For Full Guide:** See `POSTMAN_INGESTION_GUIDE.md`
