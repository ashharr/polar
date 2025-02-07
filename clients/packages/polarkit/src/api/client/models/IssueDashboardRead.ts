/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Funding } from './Funding';
import type { IssueStatus } from './IssueStatus';
import type { Label } from './Label';
import type { Platforms } from './Platforms';
import type { Reactions } from './Reactions';

export type IssueDashboardRead = {
  id: string;
  platform: Platforms;
  organization_id: string;
  repository_id: string;
  number: number;
  title: string;
  author?: any;
  labels?: Array<Label>;
  closed_by?: any;
  /**
   * GitHub reactions
   */
  reactions?: Reactions;
  state: IssueDashboardRead.state;
  issue_closed_at?: string;
  issue_modified_at?: string;
  issue_created_at: string;
  comments?: number;
  progress?: IssueStatus;
  badge_custom_content?: string;
  funding: Funding;
  pledge_badge_currently_embedded: boolean;
  /**
   * If a maintainer needs to mark this issue as solved
   */
  needs_confirmation_solved: boolean;
  /**
   * If this issue has been marked as confirmed solved through Polar
   */
  confirmed_solved_at?: string;
  /**
   * Share of rewrads that will be rewarded to contributors of this issue. A number between 0 and 100 (inclusive).
   */
  upfront_split_to_contributors?: number;
};

export namespace IssueDashboardRead {

  export enum state {
    OPEN = 'OPEN',
    CLOSED = 'CLOSED',
  }


}

