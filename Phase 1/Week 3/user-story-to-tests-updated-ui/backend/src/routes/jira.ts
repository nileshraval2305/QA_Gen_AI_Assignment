import express from 'express'
import { z } from 'zod'

export const jiraRouter = express.Router()

const JiraConnectionSchema = z.object({
  baseUrl: z.string().min(1, 'Jira base URL is required'),
  email: z.string().min(1, 'Jira email is required'),
  apiKey: z.string().min(1, 'Jira API key is required'),
})

const JiraSelfSchema = z.object({
  accountId: z.string(),
  displayName: z.string(),
  emailAddress: z.string().optional(),
})

const JiraSearchIssueSchema = z.object({
  key: z.string(),
  fields: z.object({
    summary: z.string().optional(),
    description: z.unknown().optional(),
    status: z.object({ name: z.string().optional() }).optional(),
    assignee: z.object({ displayName: z.string().optional() }).nullable().optional(),
    priority: z.object({ name: z.string().optional() }).nullable().optional(),
    issuetype: z.object({ name: z.string().optional() }).optional(),
    created: z.string().optional(),
    updated: z.string().optional(),
  }),
})

const JiraSearchSchema = z.object({
  total: z.number().optional(),
  isLast: z.boolean().optional(),
  nextPageToken: z.string().optional(),
  issues: z.array(JiraSearchIssueSchema),
})

type JiraSelfResponse = z.infer<typeof JiraSelfSchema>
type JiraSearchIssue = z.infer<typeof JiraSearchIssueSchema>

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, '')
}

function buildJiraHeaders(email: string, apiKey: string): Record<string, string> {
  return {
    Authorization: `Basic ${Buffer.from(`${email.trim()}:${apiKey.trim()}`).toString('base64')}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
}

function extractPlainText(value: unknown): string {
  if (!value) {
    return ''
  }

  if (typeof value === 'string') {
    return value
  }

  if (Array.isArray(value)) {
    return value.map(extractPlainText).filter(Boolean).join(' ')
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>

    if (typeof record.text === 'string') {
      return record.text
    }

    if (Array.isArray(record.content)) {
      return extractPlainText(record.content)
    }

    if (typeof record.value === 'string') {
      return record.value
    }
  }

  return ''
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength).trimEnd()}...`
}

async function parseJiraError(response: Response, fallbackMessage: string): Promise<string> {
  const responseText = await response.text().catch(() => '')

  if (responseText.trim()) {
    try {
      const errorData = JSON.parse(responseText) as Record<string, unknown>
      const message =
        typeof errorData.errorMessages === 'string'
          ? errorData.errorMessages
          : Array.isArray(errorData.errorMessages)
            ? errorData.errorMessages.join(', ')
            : typeof errorData.message === 'string'
              ? errorData.message
              : typeof errorData.error === 'string'
                ? errorData.error
                : null

      if (message) {
        return `${fallbackMessage}: ${message}`
      }
    } catch {
      return `${fallbackMessage}: ${response.status} ${response.statusText} - ${responseText.slice(0, 240)}`
    }
  }

  return `${fallbackMessage}: ${response.status} ${response.statusText}`
}

async function fetchJson<T>(url: string, headers: Record<string, string>, fallbackMessage: string): Promise<T> {
  const response = await fetch(url, { headers })

  if (!response.ok) {
    throw new Error(await parseJiraError(response, fallbackMessage))
  }

  return response.json() as Promise<T>
}

function mapIssueToStory(issue: JiraSearchIssue, baseUrl: string) {
  const description = truncateText(extractPlainText(issue.fields.description), 1000)

  return {
    key: issue.key,
    summary: issue.fields.summary ?? 'Untitled story',
    description,
    status: issue.fields.status?.name ?? 'Unknown',
    assignee: issue.fields.assignee?.displayName ?? 'Unassigned',
    priority: issue.fields.priority?.name ?? 'None',
    issueType: issue.fields.issuetype?.name ?? 'Story',
    created: issue.fields.created ?? '',
    updated: issue.fields.updated ?? '',
    issueUrl: `${baseUrl.replace(/\/+$/, '')}/browse/${issue.key}`,
  }
}

jiraRouter.post('/connect', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const validationResult = JiraConnectionSchema.safeParse(req.body)

    if (!validationResult.success) {
      res.status(400).json({
        error: `Validation error: ${validationResult.error.message}`,
      })
      return
    }

    const { baseUrl: rawBaseUrl, email, apiKey } = validationResult.data
    const baseUrl = normalizeBaseUrl(rawBaseUrl)

    if (!baseUrl) {
      res.status(400).json({ error: 'Jira base URL is required' })
      return
    }

    const headers = buildJiraHeaders(email, apiKey)
    const selfUrl = `${baseUrl}/rest/api/3/myself`
    const searchUrl = new URL(`${baseUrl}/rest/api/3/search/jql`)
    searchUrl.searchParams.set('jql', 'issuetype in (Story, "User Story") ORDER BY updated DESC')
    searchUrl.searchParams.set('maxResults', '20')
    searchUrl.searchParams.set('fields', 'summary,description,status,assignee,priority,issuetype,created,updated')

    const user = await fetchJson<JiraSelfResponse>(selfUrl, headers, 'Unable to validate Jira credentials')
    const searchResponse = await fetchJson<unknown>(searchUrl.toString(), headers, 'Unable to load Jira stories')

    const searchParseResult = JiraSearchSchema.safeParse(searchResponse)

    if (!searchParseResult.success) {
      res.status(502).json({ error: 'Jira search response did not match the expected shape' })
      return
    }

    res.json({
      user: {
        accountId: user.accountId,
        displayName: user.displayName,
        emailAddress: user.emailAddress,
      },
      total: searchParseResult.data.total ?? searchParseResult.data.issues.length,
      stories: searchParseResult.data.issues.map((issue) => mapIssueToStory(issue, baseUrl)),
    })
  } catch (error) {
    console.error('Error in Jira connect route:', error)
    res.status(502).json({
      error: error instanceof Error ? error.message : 'Failed to connect to Jira',
    })
  }
})