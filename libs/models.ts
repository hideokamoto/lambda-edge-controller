import 'tslib'
import { CloudFront } from 'aws-sdk'
import ConfigUpdator from './configUpdator'

// Service Client configs
export interface ControllerClient {
  cloudfront?: CloudFront;
  configUpdator?: ConfigUpdator;
}

// Allowed CloudFront request type
export type EventType = 'origin-request' | 'origin-response' | 'viewer-request' | 'viewer-response'
