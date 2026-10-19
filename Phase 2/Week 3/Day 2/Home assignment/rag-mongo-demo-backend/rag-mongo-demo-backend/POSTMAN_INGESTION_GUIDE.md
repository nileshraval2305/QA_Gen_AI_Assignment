# Postman Collection - Data Ingestion Guide

## 📦 Collection Overview

The **RAG MongoDB - Data Ingestion** collection provides a complete workflow for ingesting data into your RAG system:

1. Upload Excel files (Test Cases or User Stories)
2. Convert to JSON format
3. Create embeddings using Mistral AI
4. Store in MongoDB Atlas with Vector Search
5. Verify ingestion success

## 🚀 Quick Start

### Step 1: Import Collection

1. Open Postman
2. Click **Import** button
3. Select the file: `postman_collection_ingestion.json`
4. Collection will appear in your sidebar

### Step 2: Configure Variables

The collection uses variables for easy configuration:

**Collection Variables:**
- `baseUrl` - Default: `http://localhost:3001`
- `outputFile` - Auto-populated after upload
- `jobId` - Auto-populated after starting embedding job

**To change the base URL:**
1. Right-click the collection
2. Select **Edit**
3. Go to **Variables** tab
4. Update `baseUrl` if your server runs on a different port

### Step 3: Prepare Your Data

**For Test Cases:**
- Excel file with columns: `module`, `testCaseId`, `title`, `description`, `steps`, `expectedResults`, `priority`, `risk`, etc.
- Save as `.xlsx` format

**For User Stories:**
- Excel file with columns: `storyId`, `summary`, `description`, `status`, `priority`, `assignee`, `storyPoints`, etc.
- Save as `.xlsx` format

## 📋 Complete Ingestion Workflow

### Request 1: Health Check ✅

**Purpose:** Verify the backend server is running

**Method:** `GET /api/health`

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

**Action:** Run this first to ensure your backend is operational.

---

### Request 2: Upload Excel File 📤

**Two Options:**

#### Option A: Upload Test Cases

**Method:** `POST /api/upload-excel`

**Body (form-data):**
- `file`: Select your Excel file (e.g., `testcases.xlsx`)
- `dataType`: `testcases`
- `sheetName`: `Testcases` (optional, defaults to first sheet)

**Expected Response:**
```json
{
  "success": true,
  "message": "Test cases file converted successfully",
  "outputFile": "converted-1770988313558.json",
  "output": "✅ Converted 150 rows from \"Testcases\" into..."
}
```

**What Happens:**
1. Excel file is uploaded to `uploads/` folder
2. Conversion script extracts data from specified sheet
3. JSON file is created in `src/data/` folder
4. Output filename is saved to collection variable `{{outputFile}}`

#### Option B: Upload User Stories

**Method:** `POST /api/upload-excel`

**Body (form-data):**
- `file`: Select your Excel file (e.g., `userstories.xlsx`)
- `dataType`: `userstories`
- `sheetName`: `stories` (optional)

**Expected Response:**
```json
{
  "success": true,
  "message": "User stories file converted successfully",
  "outputFile": "stories-1770988363821.json",
  "output": "✅ Converted 85 user stories from \"stories\" into..."
}
```

**Column Mapping:**
The system automatically maps various Excel column names to standard fields:
- `Story Key`, `Story ID`, `ID` → `key`
- `Summary`, `Title`, `Story Title` → `summary`
- `Description`, `Story Description` → `description`
- `Priority`, `Story Priority` → `priority`
- And many more...

---

### Request 3: List Available Files 📁

**Purpose:** See all JSON files ready for embedding creation

**Method:** `GET /api/files`

**Expected Response:**
```json
[
  {
    "name": "converted-1770988313558.json",
    "path": "/full/path/to/file",
    "size": 245678,
    "modified": "2026-05-07T10:30:00.000Z",
    "type": "json"
  },
  {
    "name": "stories-1770988363821.json",
    "path": "/full/path/to/file",
    "size": 189234,
    "modified": "2026-05-07T11:15:00.000Z",
    "type": "json"
  }
]
```

**Use Case:** Verify your uploaded file was converted successfully and get the exact filename for the next step.

---

### Request 4: Create Embeddings 🧠

**Three Options (Choose One):**

#### Option A: Single File Processing (Slow - Not Recommended)

**Method:** `POST /api/create-embeddings`

**Body (JSON):**
```json
{
  "files": ["converted-1770988313558.json"]
}
```

**Pros:** Simple, processes one document at a time
**Cons:** Very slow (processes documents sequentially)
**Use When:** Testing with small datasets (< 50 documents)

---

#### Option B: Batch Processing - Test Cases (RECOMMENDED ⚡)

**Method:** `POST /api/create-embeddings-batch`

**Body (JSON):**
```json
{
  "files": ["converted-1770988313558.json"],
  "scriptName": "create-embeddings-batch-mistral.js",
  "jobType": "testcases"
}
```

**Expected Response:**
```json
{
  "success": true,
  "jobId": "job-1770988400000-abc123",
  "message": "Batch embedding creation started using create-embeddings-batch-mistral.js",
  "filesCount": 1,
  "jobType": "testcases"
}
```

**Pros:**
- 10-50x faster than single processing
- Batch API calls (lower cost)
- Parallel processing
- Better error handling

**Use When:** Processing test cases (recommended for all sizes)

---

#### Option C: Batch Processing - User Stories (RECOMMENDED ⚡)

**Method:** `POST /api/create-embeddings-batch`

**Body (JSON):**
```json
{
  "files": ["stories-1770988363821.json"],
  "scriptName": "create-userstories-embeddings-batch-mistral.js",
  "jobType": "userstories"
}
```

**Expected Response:**
```json
{
  "success": true,
  "jobId": "job-1770988500000-xyz789",
  "message": "Batch embedding creation started using create-userstories-embeddings-batch-mistral.js",
  "filesCount": 1,
  "jobType": "userstories"
}
```

**Pros:**
- Optimized for user story format
- Fast batch processing
- Handles user story-specific fields

**Use When:** Processing user stories (recommended for all sizes)

---

### Request 5: Check Job Status 🔍

**Purpose:** Monitor the progress of embedding creation

**Method:** `GET /api/jobs/{{jobId}}`

**Note:** The `{{jobId}}` variable is automatically set from the previous request.

**Expected Response (In Progress):**
```json
{
  "id": "job-1770988400000-abc123",
  "files": ["converted-1770988313558.json"],
  "status": "in-progress",
  "progress": 0,
  "total": 1,
  "results": [],
  "startTime": "2026-05-07T12:00:00.000Z",
  "currentFile": "testcases",
  "message": "Processing batch 3/10..."
}
```

**Expected Response (Completed):**
```json
{
  "id": "job-1770988400000-abc123",
  "files": ["converted-1770988313558.json"],
  "status": "completed",
  "progress": 1,
  "total": 1,
  "results": [
    {
      "file": "testcases",
      "status": "completed",
      "output": "✅ Batch script completed successfully!\n💰 Total Cost: $0.002500\n🔢 Total Tokens: 25000\n📊 Processed: 150/150"
    }
  ],
  "startTime": "2026-05-07T12:00:00.000Z",
  "endTime": "2026-05-07T12:05:30.000Z",
  "message": "Batch processing completed for testcases"
}
```

**Expected Response (Failed):**
```json
{
  "id": "job-1770988400000-abc123",
  "status": "failed",
  "error": "Failed to connect to MongoDB",
  "results": [
    {
      "file": "testcases",
      "status": "failed",
      "error": "Connection timeout"
    }
  ]
}
```

**Polling Strategy:**
- Poll every 5-10 seconds for small datasets
- Poll every 30-60 seconds for large datasets
- Stop polling when status is "completed" or "failed"

---

### Request 6: Get Active Jobs 📊

**Purpose:** See all currently running embedding jobs

**Method:** `GET /api/jobs/active`

**Expected Response:**
```json
{
  "jobs": [
    {
      "id": "job-1770988400000-abc123",
      "status": "in-progress",
      "currentFile": "testcases",
      "progress": 0,
      "total": 1,
      "startTime": "2026-05-07T12:00:00.000Z"
    }
  ]
}
```

**Use Case:** Monitor multiple embedding jobs running simultaneously.

---

### Request 7: Verify Ingestion ✅

**Purpose:** Confirm data was successfully stored in MongoDB

**Method:** `GET /api/metadata/distinct`

**Expected Response (Success):**
```json
{
  "success": true,
  "metadata": {
    "modules": [
      "Login",
      "Dashboard",
      "User Management",
      "Reports",
      "Settings"
    ],
    "priorities": [
      "High",
      "Medium",
      "Low"
    ],
    "risks": [
      "High",
      "Medium",
      "Low"
    ],
    "types": [
      "Automated",
      "Manual"
    ]
  }
}
```

**Expected Response (Empty Collection):**
```json
{
  "success": true,
  "metadata": {
    "modules": [],
    "priorities": [],
    "risks": [],
    "types": []
  },
  "message": "Collection is empty. Please create embeddings first."
}
```

**What This Tells You:**
- ✅ If you see values in the arrays → Data successfully ingested!
- ❌ If arrays are empty → Embeddings not created yet or failed

---

## 🎯 Complete Workflow Example

### Scenario: Ingest 150 Test Cases

**Step 1:** Health Check
```
GET /api/health
→ Status: 200 OK
```

**Step 2:** Upload Excel
```
POST /api/upload-excel
Body: file=testcases.xlsx, dataType=testcases
→ outputFile: "converted-1770988313558.json"
```

**Step 3:** List Files (Optional)
```
GET /api/files
→ Verify file exists
```

**Step 4:** Create Embeddings (Batch)
```
POST /api/create-embeddings-batch
Body: {
  "files": ["converted-1770988313558.json"],
  "scriptName": "create-embeddings-batch-mistral.js",
  "jobType": "testcases"
}
→ jobId: "job-1770988400000-abc123"
```

**Step 5:** Monitor Progress
```
GET /api/jobs/job-1770988400000-abc123
→ Poll every 10 seconds until status = "completed"
```

**Step 6:** Verify Success
```
GET /api/metadata/distinct
→ Check that modules, priorities, etc. are populated
```

**Result:** 150 test cases with embeddings stored in MongoDB! 🎉

---

## 🔧 Troubleshooting

### Issue: "No file uploaded"
**Solution:** Ensure you're using `form-data` body type and selecting a file, not typing the path.

### Issue: "Database 'xxx' not found"
**Solution:** Check your `.env` file has correct `DB_NAME` and `COLLECTION_NAME`.

### Issue: "Failed to generate embedding"
**Solution:** Verify `MISTRAL_API_KEY` in `.env` is valid. Get a key from https://console.mistral.ai/

### Issue: "Search index 'xxx' not found"
**Solution:** Create Vector Search indexes in MongoDB Atlas before creating embeddings.

### Issue: Job stuck at "in-progress"
**Solution:** 
1. Check server logs for errors
2. Verify MongoDB connection
3. Check API key limits (Mistral AI)
4. Restart the server if needed

### Issue: "Collection is empty" after embeddings
**Solution:**
1. Check job status - may still be processing
2. Verify job completed successfully
3. Check MongoDB Atlas for documents
4. Verify collection name matches `.env`

---

## 💡 Best Practices

### 1. Use Batch Processing
Always use batch endpoints for better performance:
- Test Cases: `create-embeddings-batch-mistral.js`
- User Stories: `create-userstories-embeddings-batch-mistral.js`

### 2. Monitor Job Progress
Don't assume success - always check job status until completion.

### 3. Verify Ingestion
Always run the metadata endpoint after ingestion to confirm success.

### 4. Handle Large Files
For files with 1000+ documents:
- Expect longer processing times (5-30 minutes)
- Poll less frequently (every 30-60 seconds)
- Monitor server resources

### 5. Cost Management
- Mistral AI charges per token
- Batch processing reduces costs
- Monitor costs in job status responses

### 6. Error Handling
- Save job IDs for troubleshooting
- Check job results for per-file errors
- Review server logs for detailed errors

---

## 📊 Performance Expectations

### Single File Processing
- **50 documents:** ~5-10 minutes
- **150 documents:** ~15-30 minutes
- **500 documents:** ~50-100 minutes
- **Not recommended for production**

### Batch Processing (Recommended)
- **50 documents:** ~30-60 seconds
- **150 documents:** ~2-5 minutes
- **500 documents:** ~5-15 minutes
- **1000+ documents:** ~15-30 minutes

### Factors Affecting Speed
- Document size (longer text = more tokens)
- API rate limits (Mistral AI)
- Network latency
- Server resources

---

## 🔐 Security Notes

### API Keys
- Never commit `.env` file to version control
- Rotate API keys regularly
- Use environment-specific keys (dev/prod)

### File Uploads
- Files are temporarily stored in `uploads/`
- Cleaned up after conversion
- Validate file types before upload

### MongoDB
- Use strong connection strings
- Enable IP whitelisting in Atlas
- Use SSL/TLS connections

---

## 📚 Additional Resources

### MongoDB Atlas Vector Search
- [Setup Guide](https://www.mongodb.com/docs/atlas/atlas-vector-search/)
- [Index Configuration](https://www.mongodb.com/docs/atlas/atlas-search/field-types/knn-vector/)

### Mistral AI
- [API Documentation](https://docs.mistral.ai/)
- [Embeddings Guide](https://docs.mistral.ai/capabilities/embeddings/)
- [Pricing](https://mistral.ai/technology/#pricing)

### Postman
- [Collection Variables](https://learning.postman.com/docs/sending-requests/variables/)
- [Scripts](https://learning.postman.com/docs/writing-scripts/intro-to-scripts/)

---

## ✅ Checklist

Before starting ingestion:
- [ ] Backend server running (`npm run dev`)
- [ ] `.env` file configured with all keys
- [ ] MongoDB Atlas cluster accessible
- [ ] Vector Search indexes created
- [ ] Mistral AI API key valid
- [ ] Excel file prepared with correct columns
- [ ] Postman collection imported

After ingestion:
- [ ] Job status shows "completed"
- [ ] Metadata endpoint returns values
- [ ] MongoDB collection has documents
- [ ] Embeddings field present in documents
- [ ] Ready for search operations

---

**Collection Version:** 1.0.0  
**Last Updated:** 2026-05-07  
**Maintained By:** RAG MongoDB Demo Team
