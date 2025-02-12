import OpenGraphImage from '@/components/Organization/OpenGraphImage'
import { ImageResponse, NextRequest } from 'next/server'
import {
  Issue,
  ListResource_Issue_,
  Organization,
  Repository,
} from 'polarkit/api/client'

import { Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import { getServerURL } from 'polarkit/api/url'

const inter = Inter({ subsets: ['latin'] })

export const runtime = 'edge'

const renderOG = async (
  org_name: string,
  repository: Repository | undefined,
  issue_count: number,
  avatar: string,
  issues: Issue[],
  largeIssue: boolean,
) => {
  return new ImageResponse(
    (
      <OpenGraphImage
        org_name={org_name}
        repo_name={repository?.name}
        issue_count={issue_count}
        avatar={avatar}
        issues={issues}
        largeIssue={largeIssue}
      />
    ),
    {
      height: 630,
      width: 1200,
    },
  )
}

const listIssues = async (
  org: string,
  repo: string | null,
): Promise<ListResource_Issue_> => {
  const params = new URLSearchParams()
  params.set('platform', 'github')
  params.set('organization_name', org)
  if (repo) {
    params.set('repository_name', repo)
  }
  params.set('have_badge', 'true')
  params.set('sort', 'funding_goal_desc_and_most_positive_reactions')
  return await fetch(
    `${getServerURL()}/api/v1/issues/search?${params.toString()}`,
    {
      method: 'GET',
    },
  ).then((response) => {
    if (!response.ok) {
      throw new Error(`Unexpected ${response.status} status code`)
    }
    return response.json()
  })
}

const getOrg = async (org: string): Promise<Organization> => {
  return await fetch(
    `${getServerURL()}/api/v1/organizations/lookup?platform=github&organization_name=${org}`,
    {
      method: 'GET',
    },
  ).then((response) => {
    if (!response.ok) {
      throw new Error(`Unexpected ${response.status} status code`)
    }
    return response.json()
  })
}

const getRepo = async (org: string, repo: string): Promise<Repository> => {
  return await fetch(
    `${getServerURL()}/api/v1/repositories/lookup?platform=github&organization_name=${org}&repository_name=${repo}`,
    {
      method: 'GET',
    },
  ).then((response) => {
    if (!response.ok) {
      throw new Error(`Unexpected ${response.status} status code`)
    }
    return response.json()
  })
}

const getIssue = async (externalUrl: string): Promise<Issue> => {
  const params = new URLSearchParams()
  params.set('external_url', externalUrl)
  return await fetch(
    `${getServerURL()}/api/v1/issues/lookup?${params.toString()}`,
    {
      method: 'GET',
    },
  ).then((response) => {
    if (!response.ok) {
      throw new Error(`Unexpected ${response.status} status code`)
    }
    return response.json()
  })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  try {
    const org = searchParams.get('org')
    if (!org) {
      throw new Error('no org')
    }

    const repo = searchParams.get('repo')
    const number = searchParams.get('number')

    let orgData: Organization | undefined
    let repoData: Repository | undefined
    let issueData: Issue | undefined

    if (org && repo && number) {
      issueData = await getIssue(
        `https://github.com/${org}/${repo}/issues/${number}`,
      )
      repoData = issueData.repository
      orgData = repoData.organization
    } else if (org && repo) {
      repoData = await getRepo(org, repo)
      orgData = repoData.organization
    } else if (org) {
      orgData = await getOrg(org)
    }

    if (!orgData) {
      notFound()
    }

    let issues: Issue[] = []
    let largeIssue = false
    let total_issue_count = 0

    if (issueData) {
      issues = [issueData]
      largeIssue = true
    } else {
      const res = await listIssues(org, repo)
      if (res.items) {
        issues = res.items
        total_issue_count = res.pagination.total_count
      }
    }

    return await renderOG(
      orgData.name,
      repoData,
      total_issue_count,
      orgData.avatar_url,
      issues,
      largeIssue,
    )
  } catch (error) {
    console.log(error)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}
