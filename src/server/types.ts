import { AcmeMethodName, AcmeParameters } from '@/shared/AnyCallableMethodEncyclopedia';
import { FileMetadataResponse } from '@google/generative-ai/server';

export type MediaArgs = {
  s3Uri?: string;
  mimeType?: string;
  googleFile?: FileMetadataResponse;
  google4xVideo?: FileMetadataResponse;
  googleAudio?: FileMetadataResponse;
};

export type AcmeMessages = { user: string[]; model?: string[] };

export type AcmeBuildRequest = {
  method: AcmeMethodName;
  messages: AcmeMessages;
  mediaArgs?: MediaArgs;
  parameters?: AcmeParameters;
};
