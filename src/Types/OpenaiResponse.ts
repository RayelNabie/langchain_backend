import { BaseMessage } from '@langchain/core/messages';
import type { UsageMetadata, ResponseMetadata } from '@langchain/core/messages';

export default interface OpenaiResponse {
  answer: BaseMessage['content'];
  metadata: ResponseMetadata;
  usage?: UsageMetadata;
}
