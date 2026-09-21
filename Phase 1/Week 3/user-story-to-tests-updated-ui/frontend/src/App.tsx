import { Fragment, useState, type FormEvent } from 'react'
import { connectAndFetchJiraStories, generateTests } from './api'
import {
  GenerateRequest,
  GenerateResponse,
  JiraConnectionRequest,
  JiraConnectionResult,
  JiraStory,
  TestCase,
} from './types'

const INITIAL_FORM_DATA: GenerateRequest = {
  storyTitle: '',
  acceptanceCriteria: '',
  testSummary: '',
  description: '',
  additionalInfo: '',
}

const INITIAL_JIRA_CONFIG: JiraConnectionRequest = {
  baseUrl: '',
  email: '',
  apiKey: '',
}

function formatDateTime(value: string): string {
  if (!value) {
    return 'Unknown'
  }

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return value
  }

  return parsedDate.toLocaleString()
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength).trimEnd()}...`
}

function App() {
  const [formData, setFormData] = useState<GenerateRequest>(INITIAL_FORM_DATA)
  const [jiraConfig, setJiraConfig] = useState<JiraConnectionRequest>(INITIAL_JIRA_CONFIG)
  const [jiraConnection, setJiraConnection] = useState<JiraConnectionResult | null>(null)
  const [jiraError, setJiraError] = useState<string | null>(null)
  const [jiraStatus, setJiraStatus] = useState<string | null>(null)
  const [results, setResults] = useState<GenerateResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isJiraConnecting, setIsJiraConnecting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedTestCases, setExpandedTestCases] = useState<Set<string>>(new Set())
  const [selectedStoryKey, setSelectedStoryKey] = useState<string | null>(null)

  const toggleTestCaseExpansion = (testCaseId: string) => {
    const newExpanded = new Set(expandedTestCases)

    if (newExpanded.has(testCaseId)) {
      newExpanded.delete(testCaseId)
    } else {
      newExpanded.add(testCaseId)
    }

    setExpandedTestCases(newExpanded)
  }

  const handleInputChange = (field: keyof GenerateRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleJiraConfigChange = (field: keyof JiraConnectionRequest, value: string) => {
    setJiraConfig((prev) => ({ ...prev, [field]: value }))
  }

  const clearInputs = () => {
    setFormData(INITIAL_FORM_DATA)
    setExpandedTestCases(new Set())
    setSelectedStoryKey(null)
  }

  const resetForm = () => {
    clearInputs()
    setResults(null)
    setError(null)
  }

  const populateFormFromStory = (story: JiraStory) => {
    setSelectedStoryKey(story.key)
    setFormData((prev) => ({
      ...prev,
      storyTitle: story.summary,
      description: story.description || prev.description,
      testSummary: `Create test cases for ${story.key}`,
      additionalInfo: [
        `Jira Issue: ${story.issueUrl}`,
        `Status: ${story.status}`,
        `Priority: ${story.priority}`,
        `Assignee: ${story.assignee}`,
      ].join('\n'),
      acceptanceCriteria:
        prev.acceptanceCriteria || `Validate the behavior defined in ${story.key} - ${story.summary}`,
    }))
  }

  const handleJiraConnect = async () => {
    setIsJiraConnecting(true)
    setJiraError(null)
    setJiraStatus(null)

    try {
      const connectionResult = await connectAndFetchJiraStories(jiraConfig)
      setJiraConnection(connectionResult)

      if (connectionResult.stories.length > 0) {
        setJiraStatus(
          `Connected as ${connectionResult.user.displayName}. Loaded ${connectionResult.stories.length} user stories.`,
        )
        setSelectedStoryKey(connectionResult.stories[0].key)
      } else {
        setJiraStatus(`Connected as ${connectionResult.user.displayName}. No user stories were returned.`)
        setSelectedStoryKey(null)
      }
    } catch (connectError) {
      setJiraConnection(null)
      setJiraStatus(null)
      setJiraError(connectError instanceof Error ? connectError.message : 'Failed to connect to Jira')
    } finally {
      setIsJiraConnecting(false)
    }
  }

  const handleJiraDisconnect = () => {
    setJiraConnection(null)
    setJiraStatus(null)
    setJiraError(null)
    setJiraConfig(INITIAL_JIRA_CONFIG)
    setSelectedStoryKey(null)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!formData.storyTitle.trim() || !formData.acceptanceCriteria.trim() || !formData.testSummary.trim()) {
      setError('Story Title, Acceptance Criteria, and Test Summary are required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await generateTests(formData)
      setResults(response)
      clearInputs()
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : 'Failed to generate tests')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        :root {
          --bg: #f4f7f3;
          --surface: #ffffff;
          --surface-soft: #fbfdf9;
          --border: #e3e8e0;
          --text: #1f2a24;
          --muted: #6b7a72;
          --brand: #00c853;
          --brand-dark: #009624;
          --brand-darker: #00791d;
          --brand-soft: #e6f7ec;
          --brand-faint: rgba(0, 200, 83, 0.08);
          --accent: #1f8a4c;
          --warning-bg: #fdeceb;
          --warning-border: #f5c2be;
          --warning-text: #b3261e;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          color: var(--text);
          line-height: 1.6;
          min-height: 100vh;
          background:
            radial-gradient(900px 500px at 8% -8%, rgba(0,200,83,0.14), transparent 55%),
            radial-gradient(700px 400px at 100% 0%, rgba(0,200,83,0.08), transparent 50%),
            var(--bg);
          background-attachment: fixed;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes floatGlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .container {
          max-width: 95%;
          width: 100%;
          margin: 0 auto;
          padding: 24px;
          min-height: 100vh;
        }

        @media (min-width: 768px) { .container { max-width: 92%; padding: 36px; } }
        @media (min-width: 1024px) { .container { max-width: 90%; padding: 44px; } }
        @media (min-width: 1600px) { .container { max-width: 1600px; padding: 52px; } }

        .header {
          text-align: center;
          margin-bottom: 40px;
          animation: fadeUp 0.6s ease both;
        }

        .badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 999px;
          background: var(--brand-soft);
          border: 1px solid rgba(0,200,83,0.35);
          color: var(--brand-darker);
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 18px;
        }

        .badge-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--brand);
          box-shadow: 0 0 12px var(--brand);
          animation: floatGlow 2.4s ease-in-out infinite;
        }

        .title {
          font-size: clamp(2.1rem, 5vw, 3.2rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text);
          margin-bottom: 12px;
        }

        .title .accent { color: var(--brand-dark); }

        .subtitle {
          color: var(--muted);
          font-size: 1.05rem;
          max-width: 680px;
          margin: 0 auto;
        }

        .page-actions {
          display: flex;
          justify-content: flex-end;
          margin: 0 0 14px 0;
          gap: 12px;
          flex-wrap: wrap;
        }

        .reset-btn {
          background: #ffffff;
          color: var(--brand-dark);
          border: 1px solid rgba(0,200,83,0.28);
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.25s ease, background 0.2s, color 0.2s;
          box-shadow: 0 6px 16px rgba(31,42,36,0.05);
        }

        .reset-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          background: #f3faf5;
          box-shadow: 0 12px 24px rgba(31,42,36,0.08);
        }

        .reset-btn:active:not(:disabled) { transform: translateY(0); }

        .reset-btn:disabled {
          cursor: not-allowed;
          opacity: 0.65;
          box-shadow: none;
        }

        .workspace {
          display: grid;
          grid-template-columns: 1fr;
          gap: 26px;
          align-items: stretch;
        }

        @media (min-width: 1024px) {
          .workspace {
            grid-template-columns: minmax(440px, 520px) 1fr;
          }
        }

        @media (min-width: 1600px) {
          .workspace {
            grid-template-columns: minmax(520px, 600px) 1fr;
          }
        }

        .form-container {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(31,42,36,0.06);
          animation: fadeUp 0.6s ease 0.08s both;
          height: 100%;
        }

        @media (min-width: 1024px) {
          .form-container {
            position: sticky;
            top: 24px;
          }
        }

        .section-title {
          font-size: 1.03rem;
          font-weight: 800;
          color: var(--text);
          margin-bottom: 8px;
        }

        .section-copy {
          color: var(--muted);
          font-size: 13.5px;
          margin-bottom: 16px;
        }

        .section-divider {
          height: 1px;
          background: linear-gradient(90deg, rgba(0, 200, 83, 0.26), rgba(0, 200, 83, 0.06));
          margin: 18px 0;
        }

        .form-group { margin-bottom: 16px; }
        .form-group:last-of-type { margin-bottom: 0; }

        .form-label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: var(--text);
          font-size: 14px;
        }

        .form-label .req { color: var(--brand-dark); margin-left: 3px; }

        .form-input, .form-textarea {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid var(--border);
          border-radius: 11px;
          font-size: 14px;
          color: var(--text);
          background: #fbfdfa;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          font-family: inherit;
        }

        .form-input::placeholder, .form-textarea::placeholder { color: #9aa89f; }

        .form-input:focus, .form-textarea:focus {
          outline: none;
          border-color: var(--brand);
          background: #fff;
          box-shadow: 0 0 0 4px rgba(0,200,83,0.18);
        }

        .form-textarea { resize: none; min-height: 96px; }
        .form-textarea.tall { min-height: 120px; }

        .jira-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 16px;
        }

        .connect-btn, .secondary-btn, .submit-btn {
          border: none;
          cursor: pointer;
          font-weight: 700;
          transition: transform 0.15s ease, box-shadow 0.25s ease, filter 0.2s, background 0.2s, color 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .connect-btn {
          background: linear-gradient(120deg, var(--brand), var(--brand-dark));
          color: #fff;
          padding: 12px 18px;
          border-radius: 12px;
          box-shadow: 0 8px 22px rgba(0,200,83,0.35);
        }

        .connect-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(0,200,83,0.45);
          filter: brightness(1.03);
        }

        .secondary-btn {
          background: #fff;
          color: var(--brand-dark);
          border: 1px solid rgba(0,200,83,0.24);
          padding: 12px 18px;
          border-radius: 12px;
          box-shadow: 0 6px 16px rgba(31,42,36,0.05);
        }

        .secondary-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          background: #f3faf5;
          box-shadow: 0 12px 24px rgba(31,42,36,0.08);
        }

        .connect-btn:disabled, .secondary-btn:disabled {
          cursor: not-allowed;
          opacity: 0.7;
          box-shadow: none;
          transform: none;
        }

        .submit-btn {
          margin-top: 20px;
          width: 100%;
          background: linear-gradient(120deg, var(--brand), var(--brand-dark));
          color: #fff;
          padding: 13px 28px;
          border-radius: 12px;
          font-size: 15px;
          letter-spacing: 0.02em;
          box-shadow: 0 8px 22px rgba(0,200,83,0.35);
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(0,200,83,0.45);
          filter: brightness(1.03);
        }

        .submit-btn:active:not(:disabled),
        .connect-btn:active:not(:disabled),
        .secondary-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          cursor: not-allowed;
          background: #c6d4bb;
          box-shadow: none;
          transform: none;
        }

        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.5);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        .output-col {
          min-width: 0;
          position: relative;
          display: flex;
          flex-direction: column;
          height: 100%;
          gap: 18px;
        }

        .error-banner,
        .success-banner,
        .status-banner {
          border-radius: 12px;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: fadeUp 0.3s ease both;
        }

        .error-banner {
          background: var(--warning-bg);
          border: 1px solid var(--warning-border);
          color: var(--warning-text);
        }

        .success-banner {
          background: #edf9f1;
          border: 1px solid #c3e8cf;
          color: var(--accent);
        }

        .status-banner {
          background: #f5f9f2;
          border: 1px solid var(--border);
          color: var(--text);
          justify-content: space-between;
          flex-wrap: wrap;
        }

        .status-banner strong { color: var(--brand-darker); }

        .placeholder-card {
          background:
            radial-gradient(400px 200px at 50% 0%, rgba(0,200,83,0.08), transparent 70%),
            var(--surface);
          border: 1px dashed rgba(0,200,83,0.45);
          border-radius: 18px;
          padding: 72px 34px;
          text-align: center;
          color: var(--muted);
          min-height: 420px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          animation: fadeUp 0.5s ease both;
          flex: 1;
        }

        .placeholder-icon {
          width: 76px;
          height: 76px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          background: var(--brand-soft);
          border: 1px solid rgba(0,200,83,0.35);
          margin-bottom: 20px;
          animation: floatGlow 3s ease-in-out infinite;
        }

        .placeholder-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 8px;
        }

        .placeholder-text {
          max-width: 380px;
          font-size: 14.5px;
        }

        .placeholder-hints {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          margin-top: 22px;
        }

        .meta-chip {
          font-size: 12.5px;
          color: var(--brand-darker);
          background: var(--brand-soft);
          border: 1px solid rgba(0,200,83,0.3);
          padding: 5px 12px;
          border-radius: 999px;
          font-weight: 600;
        }

        .placeholder-hints .meta-chip { background: #f3f6ef; }

        .loading {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 18px;
          text-align: center;
          padding: 56px 30px;
          color: var(--muted);
          font-size: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          box-shadow: 0 10px 30px rgba(31,42,36,0.06);
          flex: 1;
        }

        .loading .big-spinner {
          width: 42px;
          height: 42px;
          border: 3px solid rgba(0,200,83,0.2);
          border-top-color: var(--brand-dark);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .stories-container,
        .results-container {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(31,42,36,0.06);
          animation: fadeUp 0.5s ease both;
        }

        .stories-header,
        .results-header {
          margin-bottom: 20px;
          padding-bottom: 18px;
          border-bottom: 1px solid var(--border);
        }

        .stories-title,
        .results-title {
          font-size: 1.45rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 12px;
        }

        .results-meta,
        .stories-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .stories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 14px;
        }

        .story-card {
          border: 1px solid var(--border);
          border-radius: 16px;
          background: linear-gradient(180deg, #ffffff 0%, #fbfdfa 100%);
          padding: 16px;
          box-shadow: 0 8px 18px rgba(31,42,36,0.05);
          transition: transform 0.15s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .story-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 28px rgba(31,42,36,0.08);
          border-color: rgba(0,200,83,0.28);
        }

        .story-card.active {
          border-color: rgba(0,200,83,0.55);
          box-shadow: 0 16px 32px rgba(0,200,83,0.14);
        }

        .story-card-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
        }

        .story-key {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-weight: 800;
          color: var(--brand-darker);
        }

        .story-key-badge {
          font-size: 12px;
          padding: 4px 9px;
          border-radius: 999px;
          background: var(--brand-soft);
          border: 1px solid rgba(0,200,83,0.25);
          color: var(--brand-darker);
        }

        .story-status {
          font-size: 11.5px;
          padding: 5px 10px;
          border-radius: 999px;
          background: #eef7ff;
          border: 1px solid #cfe3fb;
          color: #2b6cb0;
          font-weight: 700;
          white-space: nowrap;
        }

        .story-title {
          font-size: 1rem;
          color: var(--text);
          line-height: 1.45;
          font-weight: 700;
        }

        .story-snippet {
          font-size: 13.5px;
          color: var(--muted);
          line-height: 1.55;
          white-space: pre-line;
        }

        .story-meta-list {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .story-meta-item {
          background: #f8fbf6;
          border: 1px solid #edf1e8;
          border-radius: 12px;
          padding: 10px 12px;
        }

        .story-meta-label {
          display: block;
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 3px;
        }

        .story-meta-value {
          font-size: 13px;
          color: var(--text);
          font-weight: 600;
          word-break: break-word;
        }

        .story-actions {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: center;
          margin-top: auto;
          flex-wrap: wrap;
        }

        .story-link,
        .story-use-btn {
          font-size: 12.5px;
          font-weight: 700;
          border-radius: 999px;
          padding: 7px 12px;
          text-decoration: none;
          cursor: pointer;
        }

        .story-link {
          color: var(--brand-darker);
          background: var(--brand-soft);
          border: 1px solid rgba(0,200,83,0.24);
        }

        .story-use-btn {
          border: 1px solid rgba(0,200,83,0.28);
          background: #fff;
          color: var(--brand-dark);
        }

        .story-use-btn:hover {
          background: #f3faf5;
        }

        .table-container { overflow-x: auto; border-radius: 12px; }

        .results-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin-top: 6px;
        }

        .results-table th {
          background: #f6f9f2;
          font-weight: 700;
          color: var(--muted);
          text-transform: uppercase;
          font-size: 11.5px;
          letter-spacing: 0.06em;
          padding: 13px 14px;
          text-align: left;
          border-bottom: 1px solid var(--border);
        }

        .results-table td {
          padding: 14px;
          text-align: left;
          border-bottom: 1px solid #eef1ec;
          color: var(--text);
          font-size: 14px;
          vertical-align: top;
        }

        .results-table tbody tr.row-main { transition: background 0.15s; }
        .results-table tbody tr.row-main:hover { background: #f7faf3; }

        .cat-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid transparent;
          text-transform: capitalize;
        }

        .category-positive { color: #1f8a4c; background: #e6f6ec; border-color: #b7e4c7; }
        .category-negative { color: #c0392b; background: #fdecea; border-color: #f5c2be; }
        .category-edge { color: #b8860b; background: #fcf3d9; border-color: #f0dca0; }
        .category-authorization { color: #7d3cc0; background: #f3e9fb; border-color: #ddc6f2; }
        .category-non-functional { color: #2b6cb0; background: #e7f0fa; border-color: #c0d8f0; }

        .test-case-id {
          cursor: pointer;
          color: var(--brand-darker);
          font-weight: 700;
          padding: 6px 10px;
          border-radius: 8px;
          transition: background-color 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .test-case-id:hover { background: var(--brand-soft); }
        .test-case-id.expanded { background: var(--brand-soft); }

        .expand-icon {
          font-size: 9px;
          transition: transform 0.2s;
          color: var(--muted);
        }

        .expand-icon.expanded { transform: rotate(90deg); color: var(--brand-dark); }

        .expanded-details {
          margin-top: 8px;
          background: #f8faf5;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          animation: fadeUp 0.3s ease both;
        }

        .details-title { margin-bottom: 16px; color: var(--text); font-size: 15px; font-weight: 700; }

        .step-item {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 14px;
          margin-bottom: 10px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .step-item:hover {
          border-color: var(--brand);
          box-shadow: 0 4px 12px rgba(0,200,83,0.15);
        }

        .step-header {
          display: grid;
          grid-template-columns: 70px 1fr 1fr 1fr;
          gap: 15px;
          align-items: start;
        }

        .step-id {
          font-weight: 700;
          color: #fff;
          background: linear-gradient(120deg, var(--brand), var(--brand-dark));
          padding: 5px 8px;
          border-radius: 8px;
          text-align: center;
          font-size: 12px;
        }

        .step-description { color: var(--text); line-height: 1.5; font-size: 13.5px; }
        .step-test-data { color: var(--muted); font-style: italic; font-size: 13px; }
        .step-expected { color: #1f8a4c; font-weight: 500; font-size: 13px; }

        .step-labels {
          display: grid;
          grid-template-columns: 70px 1fr 1fr 1fr;
          gap: 15px;
          margin-bottom: 12px;
          font-weight: 700;
          color: var(--muted);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        @media (max-width: 720px) {
          .story-meta-list,
          .step-header,
          .step-labels {
            grid-template-columns: 1fr;
          }

          .story-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .story-link,
          .story-use-btn {
            text-align: center;
          }
        }
      `}</style>

      <div className="container">
        <div className="header">
          <span className="badge-pill">
            <span className="badge-dot"></span>
            AI-Powered Test Generation
          </span>
          <h1 className="title">
            User Story to <span className="accent">Tests</span>
          </h1>
          <p className="subtitle">
            Connect Jira to pull in live user stories, then turn them into structured test cases in seconds.
          </p>
        </div>

        <div className="page-actions">
          <button type="button" className="reset-btn" onClick={resetForm} disabled={isLoading}>
            Reset Form
          </button>
        </div>

        <div className="workspace">
          <form onSubmit={handleSubmit} className="form-container">
            <div className="section-title">Jira Connection</div>
            <div className="section-copy">
              Enter your Jira Cloud base URL, email, and API key to validate the connection and load user stories.
            </div>

            <div className="form-group">
              <label htmlFor="jiraBaseUrl" className="form-label">
                Jira Base URL <span className="req">*</span>
              </label>
              <input
                type="url"
                id="jiraBaseUrl"
                className="form-input"
                value={jiraConfig.baseUrl}
                onChange={(e) => handleJiraConfigChange('baseUrl', e.target.value)}
                placeholder="https://your-domain.atlassian.net"
                spellCheck={false}
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label htmlFor="jiraEmail" className="form-label">
                Email ID <span className="req">*</span>
              </label>
              <input
                type="email"
                id="jiraEmail"
                className="form-input"
                value={jiraConfig.email}
                onChange={(e) => handleJiraConfigChange('email', e.target.value)}
                placeholder="you@company.com"
                spellCheck={false}
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label htmlFor="jiraApiKey" className="form-label">
                Jira API Key <span className="req">*</span>
              </label>
              <input
                type="password"
                id="jiraApiKey"
                className="form-input"
                value={jiraConfig.apiKey}
                onChange={(e) => handleJiraConfigChange('apiKey', e.target.value)}
                placeholder="Enter your Jira API token"
                spellCheck={false}
                autoComplete="off"
              />
            </div>

            <div className="jira-actions">
              <button
                type="button"
                className="connect-btn"
                onClick={handleJiraConnect}
                disabled={isJiraConnecting}
              >
                {isJiraConnecting && <span className="btn-spinner"></span>}
                {isJiraConnecting ? 'Connecting...' : 'Connect Jira'}
              </button>

              <button
                type="button"
                className="secondary-btn"
                onClick={handleJiraDisconnect}
                disabled={isJiraConnecting && !jiraConnection}
              >
                Disconnect
              </button>
            </div>

            {jiraError && (
              <div className="error-banner" style={{ marginTop: '16px' }}>
                <span>⚠️</span>
                <span>{jiraError}</span>
              </div>
            )}

            {jiraStatus && !jiraError && (
              <div className="success-banner" style={{ marginTop: '16px' }}>
                <span>✓</span>
                <span>{jiraStatus}</span>
              </div>
            )}

            <div className="section-divider"></div>

            <div className="section-title">Test Generation Inputs</div>
            <div className="section-copy">
              Select a Jira story or fill the fields manually to generate test cases.
            </div>

            <div className="form-group">
              <label htmlFor="storyTitle" className="form-label">
                Story Title <span className="req">*</span>
              </label>
              <input
                type="text"
                id="storyTitle"
                className="form-input"
                value={formData.storyTitle}
                onChange={(e) => handleInputChange('storyTitle', e.target.value)}
                placeholder="Enter the user story title..."
                required
                spellCheck={false}
                data-gramm="false"
                data-gramm_editor="false"
                data-enable-grammarly="false"
              />
            </div>

            <div className="form-group">
              <label htmlFor="testSummary" className="form-label">
                Test Summary <span className="req">*</span>
              </label>
              <textarea
                id="testSummary"
                className="form-textarea tall"
                value={formData.testSummary}
                onChange={(e) => handleInputChange('testSummary', e.target.value)}
                placeholder="Enter the test summary..."
                required
                spellCheck={false}
                data-gramm="false"
                data-gramm_editor="false"
                data-enable-grammarly="false"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                className="form-textarea tall"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Additional description (optional)..."
                spellCheck={false}
                data-gramm="false"
                data-gramm_editor="false"
                data-enable-grammarly="false"
              />
            </div>

            <div className="form-group">
              <label htmlFor="acceptanceCriteria" className="form-label">
                Acceptance Criteria <span className="req">*</span>
              </label>
              <textarea
                id="acceptanceCriteria"
                className="form-textarea tall"
                value={formData.acceptanceCriteria}
                onChange={(e) => handleInputChange('acceptanceCriteria', e.target.value)}
                placeholder="Enter the acceptance criteria..."
                required
                spellCheck={false}
                data-gramm="false"
                data-gramm_editor="false"
                data-enable-grammarly="false"
              />
            </div>

            <div className="form-group">
              <label htmlFor="additionalInfo" className="form-label">
                Additional Info
              </label>
              <textarea
                id="additionalInfo"
                className="form-textarea"
                value={formData.additionalInfo}
                onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                placeholder="Any additional information (optional)..."
                spellCheck={false}
                data-gramm="false"
                data-gramm_editor="false"
                data-enable-grammarly="false"
              />
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading && <span className="btn-spinner"></span>}
              {isLoading ? 'Generating...' : '✨ Generate Test Cases'}
            </button>
          </form>

          <div className="output-col">
            {isJiraConnecting && (
              <div className="loading">
                <span className="big-spinner"></span>
                Validating Jira connection and loading user stories...
              </div>
            )}

            {jiraConnection && jiraConnection.stories.length > 0 && !isJiraConnecting && (
              <div className="stories-container">
                <div className="stories-header">
                  <h2 className="stories-title">Jira User Stories</h2>
                  <div className="stories-meta">
                    <span className="meta-chip">{jiraConnection.total} total stories</span>
                    <span className="meta-chip">{jiraConnection.stories.length} loaded</span>
                    <span className="meta-chip">Connected as {jiraConnection.user.displayName}</span>
                  </div>
                </div>

                <div className="stories-grid">
                  {jiraConnection.stories.map((story) => (
                    <article className={`story-card ${selectedStoryKey === story.key ? 'active' : ''}`} key={story.key}>
                      <div className="story-card-top">
                        <div className="story-key">
                          <span className="story-key-badge">{story.key}</span>
                        </div>
                        <span className="story-status">{story.status}</span>
                      </div>

                      <div className="story-title">{story.summary}</div>
                      <div className="story-snippet">
                        {story.description ? truncate(story.description, 180) : 'No description was returned for this issue.'}
                      </div>

                      <div className="story-meta-list">
                        <div className="story-meta-item">
                          <span className="story-meta-label">Assignee</span>
                          <span className="story-meta-value">{story.assignee}</span>
                        </div>
                        <div className="story-meta-item">
                          <span className="story-meta-label">Priority</span>
                          <span className="story-meta-value">{story.priority}</span>
                        </div>
                        <div className="story-meta-item">
                          <span className="story-meta-label">Type</span>
                          <span className="story-meta-value">{story.issueType}</span>
                        </div>
                        <div className="story-meta-item">
                          <span className="story-meta-label">Updated</span>
                          <span className="story-meta-value">{formatDateTime(story.updated)}</span>
                        </div>
                      </div>

                      <div className="story-actions">
                        <a className="story-link" href={story.issueUrl} target="_blank" rel="noreferrer">
                          Open in Jira
                        </a>
                        <button type="button" className="story-use-btn" onClick={() => populateFormFromStory(story)}>
                          Use this story
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {!isJiraConnecting && jiraConnection && jiraConnection.stories.length === 0 && (
              <div className="placeholder-card" style={{ minHeight: '240px' }}>
                <div className="placeholder-icon">📋</div>
                <div className="placeholder-title">No Jira stories found</div>
                <p className="placeholder-text">
                  The connection succeeded, but Jira did not return any issues for the current search query.
                </p>
              </div>
            )}

            {error && (
              <div className="error-banner">
                <span>⚠️</span>
                {error}
              </div>
            )}

            {isLoading && (
              <div className="loading">
                <span className="big-spinner"></span>
                Generating test cases...
              </div>
            )}

            {!isLoading && !results && !error && !jiraConnection && !isJiraConnecting && (
              <div className="placeholder-card">
                <div className="placeholder-icon">🧪</div>
                <div className="placeholder-title">Connect Jira to load user stories</div>
                <p className="placeholder-text">
                  After you connect Jira, the matching user stories will appear here. You can then select one and generate test cases from the same screen.
                </p>
                <div className="placeholder-hints">
                  <span className="meta-chip">Connect Jira</span>
                  <span className="meta-chip">Load stories</span>
                  <span className="meta-chip">Generate tests</span>
                </div>
              </div>
            )}

            {!isLoading && results && (
              <div className="results-container">
                <div className="results-header">
                  <h2 className="results-title">Generated Test Cases</h2>
                  <div className="results-meta">
                    <span className="meta-chip">{results.cases.length} test case(s)</span>
                    {results.model && <span className="meta-chip">Model: {results.model}</span>}
                    {results.promptTokens > 0 && (
                      <span className="meta-chip">Tokens: {results.promptTokens + results.completionTokens}</span>
                    )}
                  </div>
                </div>

                <div className="table-container">
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>Test Case ID</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Expected Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.cases.map((testCase: TestCase) => (
                        <Fragment key={testCase.id}>
                          <tr className="row-main">
                            <td>
                              <div
                                className={`test-case-id ${expandedTestCases.has(testCase.id) ? 'expanded' : ''}`}
                                onClick={() => toggleTestCaseExpansion(testCase.id)}
                              >
                                <span className={`expand-icon ${expandedTestCases.has(testCase.id) ? 'expanded' : ''}`}>
                                  ▶
                                </span>
                                {testCase.id}
                              </div>
                            </td>
                            <td>{testCase.title}</td>
                            <td>
                              <span className={`cat-badge category-${testCase.category.toLowerCase()}`}>
                                {testCase.category}
                              </span>
                            </td>
                            <td>{testCase.expectedResult}</td>
                          </tr>
                          {expandedTestCases.has(testCase.id) && (
                            <tr>
                              <td colSpan={4}>
                                <div className="expanded-details">
                                  <h4 className="details-title">Test Steps for {testCase.id}</h4>
                                  <div className="step-labels">
                                    <div>Step ID</div>
                                    <div>Step Description</div>
                                    <div>Test Data</div>
                                    <div>Expected Result</div>
                                  </div>
                                  {testCase.steps.map((step, index) => (
                                    <div key={`${testCase.id}-${index}`} className="step-item">
                                      <div className="step-header">
                                        <div className="step-id">S{String(index + 1).padStart(2, '0')}</div>
                                        <div className="step-description">{step}</div>
                                        <div className="step-test-data">{testCase.testData || 'N/A'}</div>
                                        <div className="step-expected">
                                          {index === testCase.steps.length - 1 ? testCase.expectedResult : 'Step completed successfully'}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App