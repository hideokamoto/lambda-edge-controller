import type { DistributionConfig, LambdaFunctionAssociation } from '@aws-sdk/client-cloudfront'
import Updator from '../libs/configUpdator'

// Lambda@Edge only accepts versioned function ARNs, so these fixtures carry a version.
const functionArn = (name: string, version: number): string =>
  `arn:aws:lambda:us-east-1:123456789012:function:${name}:${version}`

const createDistributionConfig = (
  items: LambdaFunctionAssociation[],
  cacheBehaviors?: unknown
): DistributionConfig => ({
  DefaultCacheBehavior: {
    LambdaFunctionAssociations: {
      Quantity: items.length,
      Items: items
    }
  },
  ...(cacheBehaviors ? { CacheBehaviors: cacheBehaviors } : {})
}) as unknown as DistributionConfig

const countByEventType = (items: LambdaFunctionAssociation[]): Record<string, number> => {
  return items.reduce((counts: Record<string, number>, item) => {
    const key = String(item.EventType)
    counts[key] = (counts[key] || 0) + 1
    return counts
  }, {})
}

describe('libs/configUpdator.ts', () => {
  describe('constructor', () => {
    it('should set valid arn', () => {
      const c = new Updator('lambdaArn')
      expect(c.getLambdaArn()).toEqual('lambdaArn')
    })
  })
  describe('methods', () => {
    let c: any
    beforeEach(() => {
      c = new Updator('edge-lambda-arn')
    })
    describe('#getLambdaArn()', () => {
      it('should return lambda arn', () => {
        expect(c.getLambdaArn()).toEqual('edge-lambda-arn')
      })
    })
    describe('#updateEventType()', () => {
      it('should return default event type', () => {
        expect(c.getTargetEventType()).toEqual('viewer-request')
      })
      it('should update event type', () => {
        c.updateEventType('origin-request')
        expect(c.getTargetEventType()).toEqual('origin-request')
      })
    })
    describe('#createUpdateDistributionParam()', () => {
      const data = {
        Distribution: {
          Id: 'distribution id'
        },
        ETag: 'etag'
      }
      const config = {
        param: true
      }
      it('should return valid update params', () => {
        const params = c.createUpdateDistributionParam(data, config)
        expect(params).toEqual({
          Id: 'distribution id',
          IfMatch: 'etag',
          DistributionConfig: {
            param: true
          }
        })
      })
    })
    describe('detatchEdgeFunction', () => {
      it('return same param when given no associated edge lambda', () => {
        const distributionConfig = {
          DefaultCacheBehavior: {
            LambdaFunctionAssociations: {
              Quantity: 0,
              Items: []
            }
          }
        }
        const result = c.detatchEdgeFunction(distributionConfig)
        expect(
          {
            DefaultCacheBehavior: {
              LambdaFunctionAssociations: {
                Quantity: 0,
                Items: []
              }
            }
          }
        ).toEqual(
          result
        )
      })
      it('return same param when given no associated edge lambda', () => {
        const distributionConfig = {
          DefaultCacheBehavior: {
            LambdaFunctionAssociations: {
              Quantity: 1,
              Items: [
                {
                  EventType: 'hoge',
                  LambdaFunctionARN: 'arn'
                }
              ]
            }
          }
        }
        const result = c.detatchEdgeFunction(distributionConfig)
        expect(
          {
            DefaultCacheBehavior: {
              LambdaFunctionAssociations: {
                Quantity: 1,
                Items: [
                  {
                    EventType: 'hoge',
                    LambdaFunctionARN: 'arn'
                  }
                ]
              }
            }
          }
        ).toEqual(
          result
        )
      })
      it('return new param that removed edge Lambda when given associated edge lambda', () => {
        const distributionConfig = {
          DefaultCacheBehavior: {
            LambdaFunctionAssociations: {
              Quantity: 1,
              Items: [
                {
                  EventType: 'viewer-request',
                  LambdaFunctionARN: 'edge-lambda-arn'
                }
              ]
            }
          }
        }
        const result = c.detatchEdgeFunction(distributionConfig)
        expect(
          {
            DefaultCacheBehavior: {
              LambdaFunctionAssociations: {
                Quantity: 0,
                Items: []
              }
            }
          }
        ).toEqual(
          result
        )
      })
    })
    it('return new param that removed edge Lambda when given associated edge lambda and more', () => {
      const distributionConfig = {
        DefaultCacheBehavior: {
          LambdaFunctionAssociations: {
            Quantity: 2,
            Items: [
              {
                EventType: 'viewer-request',
                LambdaFunctionARN: 'edge-lambda-arn'
              },
              {
                EventType: 'hoge',
                LambdaFunctionARN: 'arn'
              }
            ]
          }
        }
      }
      const result = c.detatchEdgeFunction(distributionConfig)
      expect(
        {
          DefaultCacheBehavior: {
            LambdaFunctionAssociations: {
              Quantity: 1,
              Items: [
                {
                  EventType: 'hoge',
                  LambdaFunctionARN: 'arn'
                }
              ]
            }
          }
        }
      ).toEqual(
        result
      )
    })
    describe('#attatchEdgeFunction()', () => {
      it('should attach edge lambda arn when given no associated lambda@edge', () => {
        const distributionConfig = {
          DefaultCacheBehavior: {
            LambdaFunctionAssociations: {
              Quantity: 0,
              Items: []
            }
          }
        }
        const result = c.attatchEdgeFunction(distributionConfig)
        expect(
          {
            DefaultCacheBehavior: {
              LambdaFunctionAssociations: {
                Quantity: 1,
                Items: [
                  {
                    EventType: 'viewer-request',
                    LambdaFunctionARN: 'edge-lambda-arn'
                  }
                ]
              }
            }
          }).toEqual(
          result
        )
      })
      it('should attach edge lambda arn when given no associated lambda@edge', () => {
        const distributionConfig = {
          DefaultCacheBehavior: {
            LambdaFunctionAssociations: {
              Quantity: 2,
              Items: [
                {
                  EventType: 'viewer-request',
                  LambdaFunctionARN: 'edge-lambda-arn'
                },
                {
                  EventType: 'hoge',
                  LambdaFunctionARN: 'arn'
                }
              ]
            }
          }
        }
        const result = c.attatchEdgeFunction(distributionConfig)
        expect(
          {
            DefaultCacheBehavior: {
              LambdaFunctionAssociations: {
                Quantity: 2,
                Items: [
                  {
                    EventType: 'hoge',
                    LambdaFunctionARN: 'arn'
                  },
                  {
                    EventType: 'viewer-request',
                    LambdaFunctionARN: 'edge-lambda-arn'
                  }
                ]
              }
            }
          }).toEqual(
          result
        )
      })
    })
  })
  describe('with versioned Lambda function ARNs', () => {
    let updator: Updator
    beforeEach(() => {
      updator = new Updator(functionArn('edge-fn', 3), 'viewer-request')
    })
    describe('#attatchEdgeFunction()', () => {
      it('should replace another version of the same function on the same event type', () => {
        const config = createDistributionConfig([
          { EventType: 'viewer-request', LambdaFunctionARN: functionArn('edge-fn', 2) }
        ])
        const result = updator.attatchEdgeFunction(config)
        expect(result.DefaultCacheBehavior?.LambdaFunctionAssociations).toEqual({
          Quantity: 1,
          Items: [
            { EventType: 'viewer-request', LambdaFunctionARN: functionArn('edge-fn', 3) }
          ]
        })
      })
      it('should replace a different function on the same event type', () => {
        const config = createDistributionConfig([
          { EventType: 'viewer-request', LambdaFunctionARN: functionArn('other-fn', 1) }
        ])
        const result = updator.attatchEdgeFunction(config)
        expect(result.DefaultCacheBehavior?.LambdaFunctionAssociations).toEqual({
          Quantity: 1,
          Items: [
            { EventType: 'viewer-request', LambdaFunctionARN: functionArn('edge-fn', 3) }
          ]
        })
      })
      it('should keep associations for other event types and keep Quantity equal to the number of Items', () => {
        const originRequest = {
          EventType: 'origin-request',
          LambdaFunctionARN: functionArn('origin-fn', 5),
          IncludeBody: true
        } as LambdaFunctionAssociation
        const viewerResponse = {
          EventType: 'viewer-response',
          LambdaFunctionARN: functionArn('response-fn', 1)
        } as LambdaFunctionAssociation
        const config = createDistributionConfig([
          { EventType: 'viewer-request', LambdaFunctionARN: functionArn('edge-fn', 2) },
          originRequest,
          viewerResponse
        ])
        const result = updator.attatchEdgeFunction(config)
        const associations = result.DefaultCacheBehavior?.LambdaFunctionAssociations
        const items = associations?.Items || []
        expect(items).toHaveLength(3)
        expect(associations?.Quantity).toEqual(items.length)
        expect(items).toEqual(expect.arrayContaining([
          { EventType: 'viewer-request', LambdaFunctionARN: functionArn('edge-fn', 3) },
          { EventType: 'origin-request', LambdaFunctionARN: functionArn('origin-fn', 5), IncludeBody: true },
          { EventType: 'viewer-response', LambdaFunctionARN: functionArn('response-fn', 1) }
        ]))
        expect(countByEventType(items)).toEqual({
          'viewer-request': 1,
          'origin-request': 1,
          'viewer-response': 1
        })
      })
      it('should not change the other cache behaviors', () => {
        const cacheBehaviors = {
          Quantity: 1,
          Items: [
            {
              PathPattern: '/api/*',
              LambdaFunctionAssociations: {
                Quantity: 1,
                Items: [
                  { EventType: 'viewer-request', LambdaFunctionARN: functionArn('edge-fn', 2) }
                ]
              }
            }
          ]
        }
        const expectedCacheBehaviors = JSON.parse(JSON.stringify(cacheBehaviors))
        const config = createDistributionConfig([
          { EventType: 'viewer-request', LambdaFunctionARN: functionArn('edge-fn', 2) }
        ], cacheBehaviors)
        const result = updator.attatchEdgeFunction(config)
        expect(result.CacheBehaviors).toEqual(expectedCacheBehaviors)
        expect(result.DefaultCacheBehavior?.LambdaFunctionAssociations).toEqual({
          Quantity: 1,
          Items: [
            { EventType: 'viewer-request', LambdaFunctionARN: functionArn('edge-fn', 3) }
          ]
        })
      })
      it('should keep a single association when the same version is attached again', () => {
        const config = createDistributionConfig([
          { EventType: 'viewer-request', LambdaFunctionARN: functionArn('edge-fn', 3) }
        ])
        const result = updator.attatchEdgeFunction(config)
        expect(result.DefaultCacheBehavior?.LambdaFunctionAssociations).toEqual({
          Quantity: 1,
          Items: [
            { EventType: 'viewer-request', LambdaFunctionARN: functionArn('edge-fn', 3) }
          ]
        })
      })
    })
    describe('#detatchEdgeFunction()', () => {
      it('should remove only the exact function version', () => {
        const config = createDistributionConfig([
          { EventType: 'viewer-request', LambdaFunctionARN: functionArn('edge-fn', 2) }
        ])
        const result = updator.detatchEdgeFunction(config)
        expect(result.DefaultCacheBehavior?.LambdaFunctionAssociations).toEqual({
          Quantity: 1,
          Items: [
            { EventType: 'viewer-request', LambdaFunctionARN: functionArn('edge-fn', 2) }
          ]
        })
      })
    })
  })
})
