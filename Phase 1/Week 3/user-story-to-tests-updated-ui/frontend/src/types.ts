export interface GenerateRequest {
  storyTitle: string
  acceptanceCriteria: string
  testSummary: string
  description?: string
  additionalInfo?: string
}

export interface JiraConnectionRequest {
  baseUrl: string
  email: string
  apiKey: string
}

export interface JiraUserProfile {
  accountId: string
  displayName: string
  emailAddress?: string
}

export interface JiraStory {
  key: string
  summary: string
  description: string
  status: string
  assignee: string
  priority: string
  issueType: string
  created: string
  updated: string
  issueUrl: string
}

export interface JiraConnectionResult {
  user: JiraUserProfile
  stories: JiraStory[]
  total: number
}

export interface TestCase {
  id: string
  title: string
  steps: string[]
  testData?: string
  expectedResult: string
  category: string
}

export interface GenerateResponse {
  cases: TestCase[]
  model?: string
  promptTokens: number
  completionTokens: number
}