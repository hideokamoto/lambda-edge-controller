import Updator from '../libs/configUpdator'

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
})
