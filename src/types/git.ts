import { CommitType } from './config';

export interface DiffInfo {
  diff: string;
  truncated?: boolean;
  totalLines?: number;
}

export interface CommitMessageRequest {
  diff: string;
  type?: CommitType;
  language: 'English' | 'Chinese';
  truncated?: boolean;
}

export interface CommitMessageResponse {
  message: string;
  language?: 'English' | 'Chinese';
  partial?: boolean;
}
