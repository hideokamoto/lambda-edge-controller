import 'tslib'
import { CloudFrontClient } from '@aws-sdk/client-cloudfront'
import ConfigUpdator from './configUpdator'

// Service Client configs
export interface ControllerClient {
  cloudfront?: CloudFrontClient;
  configUpdator?: ConfigUpdator;
}

// Allowed CloudFront request type
export type EventType = 'origin-request' | 'origin-response' | 'viewer-request' | 'viewer-response'
