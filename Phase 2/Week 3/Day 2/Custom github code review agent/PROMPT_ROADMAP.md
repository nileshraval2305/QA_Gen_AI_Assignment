# Code Review AI — GitHub Reviewer Prompt Roadmap

Use these phase-wise prompts to recreate and extend the Code Review AI dashboard based on the provided GitHub Code Reviewer UI reference.

## Phase 1 — Brand and visual foundation

**Prompt**

> Create a polished web interface for Code Review AI, an engineering intelligence product. Use a deep navy background with a subtle technical grid, soft cyan and blue highlights, glass-like panels, high-contrast text, and Outfit/DM Mono typography. Create an inline code-review logo and use accessible contrast, visible keyboard focus, and reduced-motion support.

**Verify:** The page has a cohesive brand, legible typography, responsive styling, and an inline logo.

## Phase 2 — Professional navigation and dashboard layout

**Prompt**

> Add a sticky translucent header with Dashboard, GitHub Connection, History, and API Docs navigation plus an accessible n8n connection status. Build a compact GitHub file input and a review workspace in a responsive two-column layout. Be explicit that the current workflow reviews public source files; do not imply private-repository authorization.

**Verify:** Header, input, status, and workspace adapt to desktop, tablet, and mobile widths. Connection claims reflect actual request state.

## Phase 3 — Evidence-based scoring contract

**Prompt**

> In the n8n reviewer prompt, require exactly five integer scores from 0 to 20: `codeReadability`, `codeEfficiency`, `errorHandling`, `maintainability`, and `bestPractices`. Require an evidence-based rationale per dimension and make the overall score exactly equal to their sum. Use grade bands Excellent (90–100), Good (75–89), Fair (60–74), and Poor (0–59); merge guidance Approve (85–100), Request changes (60–84), and Do not merge (0–59). Do not infer quality from unseen files, invent line numbers, or claim code execution. Return only schema-valid JSON.

**Verify:** The response contains each category, valid ranges, correct total, and matching grade/recommendation thresholds.

## Phase 4 — Scored review presentation

**Prompt**

> Render the structured review with file/repository/branch metadata, overall score gauge, grade and merge badges, summary, five-axis radar chart, category score bars with rationales, detailed severity-coded findings, top recommendations, scope limitations, and an optional corrected-code example. Use safe text rendering for all model-provided values. Add copy-report and browser-local review history.

**Verify:** Category scores in the sidebar, bars, radar, and total match; findings are readable and safe; copy and history actions work.

## Phase 5 — Connect to n8n and handle failures

**Prompt**

> Connect the same-origin browser form to `/api/review`. Validate requests and permit only HTTPS GitHub file URLs; normalize standard GitHub blob URLs to raw file URLs. POST `{ "githubUrl": "<raw file URL>" }` to the configurable `N8N_WEBHOOK_URL`. Configure n8n with a POST Webhook at `/webhook/github-code-review` and a final Respond to Webhook node returning the structured JSON review. Preserve email notification behavior. Show clear validation, loading, malformed-response, HTTP, timeout, and connection errors; never display a failed request as a successful review.

**Verify:** Submit a public file through the active workflow and check response schema and score arithmetic; also verify errors for invalid URLs and unavailable n8n.

## Phase 6 — Responsive and operational finishing

**Prompt**

> Finish the interface for touch and keyboard users. Stack panels on smaller screens, prevent horizontal overflow, ensure visible focus and accessible live status, and respect reduced-motion settings. Keep webhook configuration in environment variables and avoid storing credentials in the UI.

**Verify:** Inspect desktop/tablet/mobile widths, navigate with the keyboard, test reduced motion, and verify webhook configuration without changing frontend code.

## Run locally

Use Node.js 18 or newer:

```powershell
$env:N8N_WEBHOOK_URL = "http://localhost:5678/webhook/github-code-review"
node .\server.mjs
```

Import the adjacent workflow JSON into n8n, configure its existing Groq and SMTP credentials, activate the updated workflow, then open `http://localhost:8000`.
