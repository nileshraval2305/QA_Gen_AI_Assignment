# Excel Template Guide for Data Ingestion

## 📊 Overview

This guide shows you exactly how to structure your Excel files for successful ingestion into the RAG system.

## 🧪 Test Cases Template

### Required Columns

| Column Name | Type | Required | Description | Example |
|------------|------|----------|-------------|---------|
| `module` | Text | Yes | Module/feature name | "Login" |
| `testCaseId` | Text | Yes | Unique test case ID | "TC001" |
| `title` | Text | Yes | Test case title | "Verify login with valid credentials" |
| `description` | Text | Yes | Detailed description | "This test verifies that users can log in..." |
| `steps` | Text | Yes | Test steps | "1. Navigate to login page\n2. Enter username\n3. Enter password\n4. Click login" |
| `expectedResults` | Text | Yes | Expected outcome | "User is logged in and redirected to dashboard" |
| `priority` | Text | Yes | Priority level | "High", "Medium", or "Low" |
| `automationManual` | Text | Yes | Test type | "Automated" or "Manual" |
| `risk` | Text | Yes | Risk level | "High", "Medium", or "Low" |
| `preRequisites` | Text | Optional | Prerequisites | "User account must exist" |
| `createdBy` | Text | Optional | Author name | "John Doe" |
| `createdDate` | Date | Optional | Creation date | "2024-01-15" |
| `lastModifiedDate` | Date | Optional | Last modified | "2024-02-20" |
| `linkedStories` | Text | Optional | Related stories | "US-101, US-102" |
| `version` | Text | Optional | Version | "1.0" |
| `type` | Text | Optional | Test type | "Functional", "Regression", "Smoke" |

### Sample Test Cases Excel

**Sheet Name:** `Testcases`

| module | testCaseId | title | description | steps | expectedResults | priority | automationManual | risk |
|--------|-----------|-------|-------------|-------|-----------------|----------|------------------|------|
| Login | TC001 | Verify login with valid credentials | Test successful login with correct username and password | 1. Navigate to login page<br>2. Enter valid username<br>3. Enter valid password<br>4. Click Login button | User is logged in successfully and redirected to dashboard | High | Automated | High |
| Login | TC002 | Verify login with invalid password | Test login failure with incorrect password | 1. Navigate to login page<br>2. Enter valid username<br>3. Enter invalid password<br>4. Click Login button | Error message displayed: "Invalid credentials" | High | Automated | Medium |
| Dashboard | TC003 | Verify dashboard loads after login | Test that dashboard displays correctly after successful login | 1. Login with valid credentials<br>2. Wait for dashboard to load<br>3. Verify all widgets are visible | Dashboard loads with all widgets: Recent Activity, Statistics, Quick Actions | Medium | Automated | Low |

### Download Template
Create an Excel file with these columns and save as `testcases_template.xlsx`

---

## 📝 User Stories Template

### Flexible Column Names

The system automatically maps various column names to standard fields. Use any of these:

#### Story ID
- `storyId`
- `Story Key`
- `Story ID`
- `ID`
- `Key`
- `Issue Key`

#### Summary/Title
- `summary`
- `Summary`
- `Title`
- `Story Title`
- `User Story`
- `Story Summary`

#### Description
- `description`
- `Description`
- `Story Description`
- `Details`
- `User Story Description`

#### Status
- `statusCategory`
- `Status`
- `Story Status`
- `Issue Status`

#### Priority
- `priority`
- `Priority`
- `Story Priority`
- `Issue Priority`

#### Assignee
- `assignee`
- `Assignee`
- `Assigned To`

#### Reporter
- `reporter`
- `Reporter`
- `Created By`

#### Dates
- `createdDate`, `Created`, `Created Date`, `Creation Date`
- `updatedDate`, `Updated`, `Updated Date`, `Last Modified`

#### Story Points
- `storyPoints`
- `Story Points`
- `Points`
- `Estimate`
- `Effort`

#### Components
- `components`
- `Components`
- `Component`

#### Labels
- `labels`
- `Labels`
- `Tags`

#### Fix Versions
- `fixVersions`
- `Fix Version`
- `Fix Versions`
- `Target Version`
- `Release`
- `Version`

#### Acceptance Criteria
- `acceptanceCriteria`
- `Acceptance Criteria`
- `AC`
- `Definition of Done`

#### Other Fields
- `businessValue` / `Business Value`
- `risk` / `Risk`
- `dependencies` / `Dependencies`
- `notes` / `Notes` / `Comments`
- `Sprint` / `Current Sprint`
- `Team` / `Squad`
- `projectName` / `Project`
- `parentSummary` / `Epic`

### Sample User Stories Excel

**Sheet Name:** `stories`

| Story Key | Summary | Description | Status | Priority | Assignee | Story Points | Acceptance Criteria |
|-----------|---------|-------------|--------|----------|----------|--------------|---------------------|
| US-101 | User Login | As a user, I want to log in to the system so that I can access my account | In Progress | High | John Doe | 5 | - User can enter username and password<br>- System validates credentials<br>- User is redirected to dashboard on success |
| US-102 | Password Reset | As a user, I want to reset my password so that I can regain access if I forget it | To Do | Medium | Jane Smith | 3 | - User can request password reset<br>- Email sent with reset link<br>- User can set new password |
| US-103 | Dashboard View | As a user, I want to see a dashboard with my recent activity so that I can quickly access important information | Done | High | John Doe | 8 | - Dashboard shows recent activity<br>- Statistics are displayed<br>- Quick action buttons are available |

### Download Template
Create an Excel file with these columns and save as `userstories_template.xlsx`

---

## 📋 Best Practices

### 1. Column Headers
- ✅ Use exact column names from templates
- ✅ First row must be headers
- ✅ No empty rows between header and data
- ❌ Don't use merged cells in headers
- ❌ Don't use special characters in column names

### 2. Data Format
- ✅ Use consistent date format (YYYY-MM-DD or MM/DD/YYYY)
- ✅ Use consistent priority values (High, Medium, Low)
- ✅ Use consistent status values
- ❌ Don't leave required fields empty
- ❌ Don't use formulas in data cells

### 3. Text Fields
- ✅ Use line breaks (Alt+Enter) for multi-line text
- ✅ Keep descriptions clear and concise
- ✅ Use numbered lists for steps
- ❌ Don't exceed 10,000 characters per cell
- ❌ Don't use special formatting (bold, colors) - it will be lost

### 4. Sheet Names
- ✅ Use simple sheet names: "Testcases", "stories", "Sheet1"
- ✅ Specify sheet name in upload if not default
- ❌ Don't use special characters in sheet names
- ❌ Don't use spaces at start/end of sheet names

### 5. File Format
- ✅ Save as `.xlsx` (Excel 2007+)
- ✅ Keep file size under 50MB
- ❌ Don't use `.xls` (old Excel format)
- ❌ Don't use `.csv` (use Excel format)

---

## 🎯 Data Quality Tips

### Test Cases
1. **Unique IDs:** Each test case should have a unique `testCaseId`
2. **Clear Steps:** Number steps clearly (1., 2., 3.)
3. **Expected Results:** Be specific about what should happen
4. **Consistent Modules:** Use same module names across test cases
5. **Complete Data:** Fill all required fields

### User Stories
1. **Story Format:** Use "As a [role], I want [feature], so that [benefit]"
2. **Acceptance Criteria:** Use bullet points or numbered lists
3. **Story Points:** Use Fibonacci sequence (1, 2, 3, 5, 8, 13)
4. **Dependencies:** List related story IDs clearly
5. **Status Values:** Use consistent status names

---

## 🔍 Validation Checklist

Before uploading your Excel file:

### File Structure
- [ ] File is saved as `.xlsx` format
- [ ] First row contains column headers
- [ ] No empty rows between header and data
- [ ] No merged cells
- [ ] Sheet name is simple and clear

### Required Fields (Test Cases)
- [ ] All rows have `module`
- [ ] All rows have `testCaseId` (unique)
- [ ] All rows have `title`
- [ ] All rows have `description`
- [ ] All rows have `steps`
- [ ] All rows have `expectedResults`
- [ ] All rows have `priority`
- [ ] All rows have `automationManual`
- [ ] All rows have `risk`

### Required Fields (User Stories)
- [ ] All rows have Story ID
- [ ] All rows have Summary/Title
- [ ] All rows have Description
- [ ] Priority values are consistent
- [ ] Status values are consistent

### Data Quality
- [ ] No duplicate IDs
- [ ] Dates are in consistent format
- [ ] Priority values match (High/Medium/Low)
- [ ] No special characters causing issues
- [ ] Text fields are not too long

---

## 🚨 Common Mistakes to Avoid

### ❌ Wrong Column Names
```
Bad: "Test Case ID", "Test_Case_Id", "testcaseid"
Good: "testCaseId"
```

### ❌ Empty Required Fields
```
Bad: testCaseId is empty or "N/A"
Good: testCaseId has unique value like "TC001"
```

### ❌ Inconsistent Values
```
Bad: Priority = "HIGH", "high", "H", "1"
Good: Priority = "High" (consistent)
```

### ❌ Wrong Date Format
```
Bad: "Jan 15, 2024", "15-01-2024", "2024/01/15"
Good: "2024-01-15" or "01/15/2024" (consistent)
```

### ❌ Special Characters
```
Bad: testCaseId = "TC#001", "TC-001*", "TC 001"
Good: testCaseId = "TC001" or "TC-001"
```

---

## 📊 Sample Data Sets

### Small Dataset (Testing)
- **Test Cases:** 10-50 rows
- **Processing Time:** 30-60 seconds
- **Use Case:** Testing the ingestion process

### Medium Dataset (Development)
- **Test Cases:** 50-200 rows
- **Processing Time:** 2-5 minutes
- **Use Case:** Development and QA

### Large Dataset (Production)
- **Test Cases:** 200-1000+ rows
- **Processing Time:** 5-30 minutes
- **Use Case:** Production deployment

---

## 🔧 Troubleshooting

### Issue: "No data found in sheet"
**Cause:** Sheet name doesn't match or sheet is empty
**Solution:** 
- Verify sheet name in Excel
- Specify correct sheet name in upload
- Ensure data starts from row 2 (row 1 = headers)

### Issue: "Column 'xxx' not found"
**Cause:** Required column is missing or misspelled
**Solution:**
- Check column names match exactly
- Use templates provided above
- Ensure no extra spaces in column names

### Issue: "Failed to convert"
**Cause:** Data format issues or corrupted file
**Solution:**
- Save as new `.xlsx` file
- Remove any formulas
- Remove merged cells
- Check for special characters

### Issue: Empty fields after conversion
**Cause:** Column names don't match expected names
**Solution:**
- Use exact column names from templates
- Check for typos in column headers
- Verify no extra spaces

---

## 📥 Download Templates

### Create Your Own Templates

**Test Cases Template:**
1. Open Excel
2. Create columns: `module`, `testCaseId`, `title`, `description`, `steps`, `expectedResults`, `priority`, `automationManual`, `risk`
3. Add sample data
4. Save as `testcases_template.xlsx`

**User Stories Template:**
1. Open Excel
2. Create columns: `Story Key`, `Summary`, `Description`, `Status`, `Priority`, `Assignee`, `Story Points`, `Acceptance Criteria`
3. Add sample data
4. Save as `userstories_template.xlsx`

---

## ✅ Ready to Upload?

Once your Excel file is ready:

1. **Validate** using the checklist above
2. **Save** as `.xlsx` format
3. **Upload** using Postman collection
4. **Monitor** the conversion process
5. **Verify** the output JSON file
6. **Create embeddings** using batch processing

---

**Template Version:** 1.0.0  
**Compatible With:** RAG MongoDB Demo v1.0.0  
**Last Updated:** 2026-05-07
