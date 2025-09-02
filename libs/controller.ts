import 'tslib'
import bunyan from 'bunyan'
import { CloudFrontClient, GetDistributionCommand, UpdateDistributionCommand, UpdateDistributionCommandOutput } from '@aws-sdk/client-cloudfront'
import ConfigUpdator from './configUpdator'
import { ControllerClient, EventType } from './models'
import { getLogger } from './logger'

export class LambdaEdgeController {
  // CloudFront client from AWS SDK
  private cloudfront: CloudFrontClient

  // CloudFront config updator
  private updator: ConfigUpdator

  // Log request / response
  private isDebug = false

  // Logger
  private logger: bunyan = getLogger('LambdaEdgeController')

  /**
   * constructor
   * @param {string} lambdaArn - Lambda arn
   * @param {string} [stage='development'] - stage
   * @param {ControllerClient} clients - Clients object
   **/
  constructor (lambdaArn: string, eventType: EventType = 'viewer-request', client?: ControllerClient) {
    this.cloudfront = client && client.cloudfront ? client.cloudfront : new CloudFrontClient({})
    this.updator = client && client.configUpdator ? client.configUpdator : new ConfigUpdator(lambdaArn, eventType)
  }

  /**
   * Disable logger
   */
  public disableDebugger (): this {
    this.isDebug = false
    return this
  }

  /**
   * Enable logger
   */
  public enableDebugger (): this {
    this.isDebug = true
    return this
  }

  /**
   * Reove lambda edge function from specific CloudFront Distribution
   *
   * @param {string} distributionId - CloudFront Distribution ID
   * @return {Promise} results of the workflow
   **/
  public async detachEdgeFunction (distributionId: string): Promise<UpdateDistributionCommandOutput> {
    const req = { Id: distributionId }
    if (this.isDebug) this.logger.info({ data: req, action: 'getDistribution' })
    const data = await this.cloudfront.send(new GetDistributionCommand(req))
    if (this.isDebug) this.logger.info({ data, action: 'getDistribution' })
    if (!data.Distribution || !data.Distribution.DistributionConfig) throw new Error('No such distribution')
    const config = await this.updator.createUpdateDistributionConfig(
      data.Distribution.DistributionConfig,
      'detachEdge'
    )
    const params = this.updator.createUpdateDistributionParam(data, config)
    if (this.isDebug) this.logger.info({ data: params, action: 'updateDistribution' })
    const result = await this.cloudfront.send(new UpdateDistributionCommand(params))
    if (this.isDebug) this.logger.info({ data: result, action: 'updateDistribution' })
    return result
  }

  /**
   * Attach lambda edge function to specific CloudFront Distribution
   *
   * @param {string} distributionId - CloudFront Distribution ID
   * @return {Promise} results of the workflow
   **/
  public async attachEdgeFunction (distributionId: string): Promise<UpdateDistributionCommandOutput> {
    const req = { Id: distributionId }
    if (this.isDebug) this.logger.info({ data: req, action: 'getDistribution' })
    const data = await this.cloudfront.send(new GetDistributionCommand(req))
    if (this.isDebug) this.logger.info({ data, action: 'getDistribution' })
    if (!data || !data.Distribution || !data.Distribution.DistributionConfig) throw new Error('No such distribution')
    const config = await this.updator.createUpdateDistributionConfig(
      data.Distribution.DistributionConfig,
      'attachEdge'
    )
    const params = this.updator.createUpdateDistributionParam(data, config)
    if (this.isDebug) this.logger.info({ data: params, action: 'udateDistribution' })
    const result = await this.cloudfront.send(new UpdateDistributionCommand(params))
    if (this.isDebug) this.logger.info({ data: result, action: 'updateDistribution' })
    return result
  }
}

export default LambdaEdgeController
