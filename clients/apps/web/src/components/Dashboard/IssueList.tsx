import { DashboardFilters, navigate } from '@/components/Dashboard/filters'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { InfiniteData } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import {
  IssueListResponse,
  IssueListType,
  IssueSortBy,
} from 'polarkit/api/client'
import { IssueReadWithRelations } from 'polarkit/api/types'
import { PrimaryButton } from 'polarkit/components/ui'
import React, {
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react'
import yayson from 'yayson'
import Spinner from '../Shared/Spinner'
import IssueListItem from './IssueListItem'

const IssueList = (props: {
  dashboard?: InfiniteData<IssueListResponse>
  filters: DashboardFilters
  loading: boolean
  totalCount?: number
  onSetFilters: Dispatch<SetStateAction<DashboardFilters>>
  fetchNextPage: () => void
  hasNextPage: boolean
  isInitialLoading: boolean
  isFetchingNextPage: boolean
}) => {
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = props

  const canAddRemovePolarLabel = props.filters.tab === IssueListType.ISSUES

  return (
    <div className="divide-y dark:divide-gray-800">
      {props.dashboard && (
        <>
          {!props.loading && (
            <>
              {props.dashboard.pages.map((group, i) => (
                <IssueListPage
                  page={group}
                  key={i}
                  canAddRemovePolarLabel={canAddRemovePolarLabel}
                />
              ))}
            </>
          )}

          {hasNextPage && (
            <PrimaryButton
              loading={isFetchingNextPage}
              disabled={isFetchingNextPage}
              onClick={fetchNextPage}
            >
              Load more
            </PrimaryButton>
          )}

          {props &&
            props.totalCount !== undefined &&
            props.totalCount > 100 &&
            !hasNextPage && (
              <div className="p-4 text-center text-gray-500">
                You&apos;ve reached the bottom... 🏝️
              </div>
            )}
        </>
      )}
    </div>
  )
}

export default IssueList

const IssueListPage = (props: {
  page: IssueListResponse
  canAddRemovePolarLabel: boolean
}) => {
  const [issues, setIssues] = useState<IssueReadWithRelations[]>()

  const { page } = props

  useEffect(() => {
    if (page) {
      const y = yayson({ adapter: 'default' })
      const store = new y.Store()
      const issues: IssueReadWithRelations[] = store.sync(page)
      setIssues(issues)
    } else {
      setIssues([])
    }
  }, [page])

  if (!issues) {
    return <></>
  }

  return (
    <>
      {issues.map((issue) => (
        <IssueListItem
          issue={issue}
          references={issue.references}
          dependents={issue.dependents}
          pledges={issue.pledges}
          org={issue.organization}
          repo={issue.repository}
          key={issue.id}
          showIssueProgress={true}
          canAddRemovePolarLabel={props.canAddRemovePolarLabel}
          showPledgeAction={true}
        />
      ))}
    </>
  )
}

export const Header = (props: {
  filters: DashboardFilters
  onSetFilters: Dispatch<SetStateAction<DashboardFilters>>
  totalCount?: number
  spinner?: boolean
}) => {
  const router = useRouter()

  const onSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value

    let sort: IssueSortBy =
      {
        newest: IssueSortBy.NEWEST,
        pledged_amount_desc: IssueSortBy.PLEDGED_AMOUNT_DESC,
        relevance: IssueSortBy.RELEVANCE,
        dependencies_default: IssueSortBy.DEPENDENCIES_DEFAULT,
        issues_default: IssueSortBy.ISSUES_DEFAULT,
        most_positive_reactions: IssueSortBy.MOST_POSITIVE_REACTIONS,
        most_engagement: IssueSortBy.MOST_ENGAGEMENT,
      }[value] || IssueSortBy.NEWEST

    const filters: DashboardFilters = {
      ...props.filters,
      sort,
    }

    props.onSetFilters(filters)
    navigate(router, filters)
  }

  const getTitle = (sortBy: IssueSortBy): string => {
    if (sortBy == IssueSortBy.NEWEST) {
      return 'Newest'
    }
    if (sortBy == IssueSortBy.PLEDGED_AMOUNT_DESC) {
      return 'Pledged amount'
    }
    if (sortBy == IssueSortBy.RELEVANCE) {
      return 'Relevance'
    }
    if (sortBy == IssueSortBy.DEPENDENCIES_DEFAULT) {
      return 'Most wanted'
    }
    if (sortBy == IssueSortBy.ISSUES_DEFAULT) {
      return 'Most wanted'
    }
    if (sortBy == IssueSortBy.MOST_POSITIVE_REACTIONS) {
      return 'Most reactions'
    }
    if (sortBy == IssueSortBy.MOST_ENGAGEMENT) {
      return 'Most engagement'
    }
    return 'Most wanted'
  }

  const tabFilters: IssueSortBy[] = useMemo(() => {
    const issuesTabFilters = [IssueSortBy.ISSUES_DEFAULT]
    const dependenciesTabFilters = [IssueSortBy.DEPENDENCIES_DEFAULT]

    return props.filters.tab === IssueListType.ISSUES
      ? issuesTabFilters
      : dependenciesTabFilters
  }, [props.filters.tab])

  const options: IssueSortBy[] = useMemo(() => {
    return [
      ...tabFilters,
      ...[
        IssueSortBy.MOST_POSITIVE_REACTIONS,
        IssueSortBy.MOST_ENGAGEMENT,
        IssueSortBy.NEWEST,
        IssueSortBy.PLEDGED_AMOUNT_DESC,
        IssueSortBy.RELEVANCE,
      ],
    ]
  }, [tabFilters])

  const width = useMemo(() => {
    const t = getTitle(props.filters.sort || tabFilters[0])
    return t.length * 7.5 + 35 // TODO(gustav): can we use the on-screen size instead somehow?
  }, [props.filters.sort, tabFilters])

  const onQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()
    event.stopPropagation()

    // if not set, set to relevance
    const sort = props.filters.sort || IssueSortBy.RELEVANCE
    const f: DashboardFilters = {
      ...props.filters,
      q: event.target.value,
      sort,
    }
    props.onSetFilters(f)

    navigate(router, f)
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigate(router, props.filters)
  }

  return (
    <div>
      <form
        className="mb-4 flex h-12 items-center justify-between px-2"
        onSubmit={onSubmit}
      >
        <div className="relative w-full max-w-[500px] rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            {props.spinner && <Spinner />}
            {!props.spinner && (
              <MagnifyingGlassIcon
                className="h-5 w-5 text-gray-500"
                aria-hidden="true"
              />
            )}
          </div>
          <input
            type="text"
            name="query"
            id="query"
            className="block w-full rounded-lg border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700 sm:text-sm sm:leading-6"
            placeholder="Search issues"
            onChange={onQueryChange}
            value={props.filters.q || ''}
          />
        </div>

        <div>
          <span className="mr-2 text-sm text-gray-500 dark:text-gray-400">
            Sort:
          </span>
          <select
            className="m-0 w-48 border-0 bg-transparent bg-right p-0 text-sm font-medium ring-0 focus:border-0 focus:ring-0"
            onChange={onSelect}
            style={{ width: `${width}px` }}
            value={props.filters?.sort}
          >
            {options.map((v) => (
              <option key={v} value={v}>
                {getTitle(v)}
              </option>
            ))}
          </select>
        </div>
      </form>

      <div className="mb-4 flex px-2">
        <div className="text-sm">
          {props.totalCount !== undefined && (
            <>
              <strong className="font-medium">{props.totalCount}</strong>{' '}
              <span className="text-gray-500">issues</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
