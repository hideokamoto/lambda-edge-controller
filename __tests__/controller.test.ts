import { CloudFrontClient, GetDistributionCommand, UpdateDistributionCommand, UpdateDistributionCommandInput } from '@aws-sdk/client-cloudfront'
import Controller from '../libs/controller'

describe('libs/contorller.ts', () => {
  describe('constructor', () => {
    it('should not be throw error', () => {
      expect(() => {
        new Controller('LambdaARN', 'viewer-request')
      }).not.toThrow()
    })
  })
  describe('#attachEdgeFunction()', () => {
    const functionArn = (name: string, version: number): string =>
      `arn:aws:lambda:us-east-1:123456789012:function:${name}:${version}`

    it('should send a single viewer-request association when another version is already attached', async () => {
      const updateInputs: UpdateDistributionCommandInput[] = []
      const cloudfront = {
        send: async (command: unknown) => {
          if (command instanceof GetDistributionCommand) {
            return {
              ETag: 'etag',
              Distribution: {
                Id: 'EDISTRIBUTIONID',
                DistributionConfig: {
                  DefaultCacheBehavior: {
                    LambdaFunctionAssociations: {
                      Quantity: 1,
                      Items: [
                        { EventType: 'viewer-request', LambdaFunctionARN: functionArn('edge-fn', 2) }
                      ]
                    }
                  }
                }
              }
            }
          }
          if (command instanceof UpdateDistributionCommand) {
            updateInputs.push(command.input)
            return {}
          }
          throw new Error('unexpected command')
        }
      } as unknown as CloudFrontClient
      const controller = new Controller(functionArn('edge-fn', 3), 'viewer-request', { cloudfront })

      await controller.attachEdgeFunction('EDISTRIBUTIONID')

      expect(updateInputs).toHaveLength(1)
      expect(updateInputs[0].Id).toEqual('EDISTRIBUTIONID')
      expect(updateInputs[0].IfMatch).toEqual('etag')
      expect(updateInputs[0].DistributionConfig?.DefaultCacheBehavior?.LambdaFunctionAssociations).toEqual({
        Quantity: 1,
        Items: [
          { EventType: 'viewer-request', LambdaFunctionARN: functionArn('edge-fn', 3) }
        ]
      })
    })
  })
})
