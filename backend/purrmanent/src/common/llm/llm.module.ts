import { Global, Module } from '@nestjs/common';
import { LlmService } from './llm.service';

/** Global so Crisis and Coach can both inject the shared LLM client. */
@Global()
@Module({
  providers: [LlmService],
  exports: [LlmService],
})
export class LlmModule {}
