import { CommitMessageRequest, CommitMessageResponse } from '../../types/git';

export interface IAIService {
  generateCommitMessage(request: CommitMessageRequest): Promise<CommitMessageResponse>;
  validateConnection(): Promise<boolean>;
}
