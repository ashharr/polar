'use client'

import { useParams, useSearchParams } from 'next/navigation'
import type { Organization, Repository } from 'polarkit/api/client'
import { useListOrganizations, useListRepositories } from 'polarkit/hooks'
import { useStore } from 'polarkit/store'
import { useEffect, useState } from 'react'

export const useCurrentOrgAndRepoFromURL = (): {
  org: Organization | undefined
  repo: Repository | undefined
  isLoaded: boolean
  haveOrgs: boolean
} => {
  // org and repo from router params "/foo/[organization]/bar"
  const params = useParams()
  const paramsOrg = params?.organization
  const paramsRepo = params?.repo

  // repo can also be set as a query arg
  const search = useSearchParams()
  const searchRepo = search?.get('repo')

  const listOrganizationsQuery = useListOrganizations()
  const listRepositoriesQuery = useListRepositories()

  const [org, setOrg] = useState<Organization | undefined>(undefined)
  const [repo, setRepo] = useState<Repository | undefined>(undefined)
  const [haveOrgs, setHaveOrgs] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const setCurrentOrgRepo = useStore((state) => state.setCurrentOrgRepo)
  const setUserHaveOrgs = useStore((state) => state.setUserHaveOrgs)

  useEffect(() => {
    const orgSlug = typeof paramsOrg === 'string' ? paramsOrg : ''

    // Repo slug form param or search
    let repoSlug = ''
    if (typeof paramsRepo === 'string') {
      repoSlug = paramsRepo
    } else if (typeof searchRepo === 'string') {
      repoSlug = searchRepo
    }

    let nextOrg: Organization | undefined
    let nextRepo: Repository | undefined

    // Get repo and org
    if (orgSlug && repoSlug && listRepositoriesQuery.data?.items) {
      const repo = listRepositoriesQuery.data.items.find(
        (r) => r.name === repoSlug && r.organization?.name === orgSlug,
      )

      if (repo) {
        nextOrg = repo.organization
        nextRepo = repo
      }
    }

    // Get org if no org found above
    if (!nextOrg && orgSlug && listOrganizationsQuery.data?.items) {
      nextOrg = listOrganizationsQuery.data.items.find(
        (o) => o.name === orgSlug,
      )
    }

    // local state
    setOrg(nextOrg)
    setRepo(nextRepo)

    setIsLoaded(
      listOrganizationsQuery.isSuccess && listRepositoriesQuery.isSuccess,
    )

    const nextUserHaveOrgs = !!(
      listOrganizationsQuery.data?.items &&
      listOrganizationsQuery.data.items.length > 0
    )

    setHaveOrgs(nextUserHaveOrgs)

    // global stores
    setCurrentOrgRepo(nextOrg, nextRepo)
    setUserHaveOrgs(nextUserHaveOrgs)
  }, [
    listOrganizationsQuery,
    listRepositoriesQuery,
    setCurrentOrgRepo,
    setUserHaveOrgs,
    paramsOrg,
    paramsRepo,
    searchRepo,
  ])

  return {
    org,
    repo,
    isLoaded,
    haveOrgs,
  }
}
