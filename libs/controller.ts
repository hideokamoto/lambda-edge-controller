import 'tslib'
import { CloudFront } from 'aws-sdk'
import ConfigUpdator from './configUpdator'
import { ControllerClient, EventType } from './models'

export class LambdaEdgeController {
  // CloudFront client from AWS SDK
  private cloudfront: CloudFront

  // CloudFront config updator
  private updator: ConfigUpdator

  /**
   * constructor
   * @param {string} lambdaArn - Lambda arn
   * @param {string} [stage='development'] - stage
   * @param {ControllerClient} clients - Clients object
   **/
  constructor (lambdaArn: string, eventType: EventType = 'viewer-request', client?: ControllerClient) {
    this.cloudfront = client && client.cloudfront ? client.cloudfront : new CloudFront()
    this.updator = client && client.configUpdator ? client.configUpdator : new ConfigUpdator(lambdaArn, eventType)
  }

  /**
   * Reove lambda edge function from specific CloudFront Distribution
   *
   * @param {string} distributionId - CloudFront Distribution ID
   * @return {Promise} results of the workflow
   **/
  public async detachEdgeFunction (distributionId: string): Promise<CloudFront.UpdateDistributionResult> {
    const data = await this.cloudfront.getDistribution({ Id: distributionId }).promise()
    if (!data.Distribution) throw new Error('No such distribution')
    const config = await this.updator.createUpdateDistributionConfig(
      data.Distribution.DistributionConfig,
      'detachEdge'
    )
    const params = this.updator.createUpdateDistributionParam(data, config)
    return this.cloudfront.updateDistribution(params).promise()
  }

  /**
   * Attach lambda edge function to specific CloudFront Distribution
   *
   * @param {string} distributionId - CloudFront Distribution ID
   * @return {Promise} results of the workflow
   **/
  public async attachEdgeFunction (distributionId: string): Promise<CloudFront.UpdateDistributionResult> {
    const data = await this.cloudfront.getDistribution({ Id: distributionId }).promise()
    if (!data || !data.Distribution) throw new Error('No such distribution')
    const config = await this.updator.createUpdateDistributionConfig(
      data.Distribution.DistributionConfig,
      'attachEdge'
    )
    const params = this.updator.createUpdateDistributionParam(data, config)
    return this.cloudfront.updateDistribution(params).promise()
  }
}

export default LambdaEdgeController
