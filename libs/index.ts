import 'tslib'
import { CloudFront } from 'aws-sdk'

const defaultLambdaFunctionAssociations: CloudFront.Types.LambdaFunctionAssociations  = {
  Quantity: 0,
  Items: []
}

export class LambdaEdgeController {
  private lambdaArn: string
  private cloudfront: CloudFront
  protected eventType: CloudFront.Types.EventType
  /**
   * constructor
   *
   * @param {string} lambdaArn - Lambda arn
   * @param {string} [stage='development'] - stage
   * @param {Class} CloudFront - AWS SDK class of CloudFront
   **/
  constructor (lambdaArn: string, eventType: CloudFront.Types.EventType = 'viewer-request',cf: CloudFront = new CloudFront()) {
    this.lambdaArn = lambdaArn
    this.eventType = eventType
    this.cloudfront = cf
  }
  /**
   * get lambda arn
   *
   * @return {string} lambda arn
   **/
  getLambdaArn (): string {
    return this.lambdaArn
  }
  getClient(): CloudFront {
    return this.cloudfront
  }

  updateEventType(type: CloudFront.Types.EventType): this {
    this.eventType = type
    return this
  }
  getTargetEventType(): CloudFront.Types.EventType {
    return this.eventType
  }
  /**
   * Reove lambda edge function from specific CloudFront Distribution
   *
   * @param {string} distributionId - CloudFront Distribution ID
   * @return {Promise} results of the workflow
   **/
  async detachEdgeFunction (distributionId: string): Promise<CloudFront.UpdateDistributionResult> {
    const data = await this.cloudfront.getDistribution({Id: distributionId}).promise()
    if (!data.Distribution) throw new Error('No such distribution')
    const config = await this.createUpdateDistributionConfig(
      data.Distribution.DistributionConfig,
      'detachEdge'
    )
    const params = this.createUpdateDistributionParam(data, config)
    return this.cloudfront.updateDistribution(params).promise()
  }
  /**
   * Attach lambda edge function to specific CloudFront Distribution
   *
   * @param {string} distributionId - CloudFront Distribution ID
   * @return {Promise} results of the workflow
   **/
  public async attachEdgeFunction (distributionId: string): Promise<CloudFront.UpdateDistributionResult> {
    const data = await this.cloudfront.getDistribution({Id: distributionId}).promise()
    if (!data || !data.Distribution) throw new Error('No such distribution')
    const config = await this.createUpdateDistributionConfig(
      data.Distribution.DistributionConfig,
      'attachEdge'
    )
    const params = this.createUpdateDistributionParam(data, config)
    return this.cloudfront.updateDistribution(params).promise()
  }
  /**
   * Generate update CloudFront distribution params
   *
   * @param {object} data - cloudfront.getCloudFrontDistribution results
   * @param {object} config - updated distribution config
   * @return {object} update distribution param
   **/
  createUpdateDistributionParam (data: CloudFront.GetDistributionResult, config: CloudFront.Types.DistributionConfig): CloudFront.UpdateDistributionRequest {
    if (!data || !data.Distribution) throw new Error('No such distribution')
    const distribution = data.Distribution
    const params = {
      Id: distribution.Id,
      IfMatch: data.ETag,
      DistributionConfig: config
    }
    return params
  }
  /**
   * Generate update CloudFront distribution config
   *
   * @param {object} distribution - CloudFront distribution data
   * @param {string} action - update action type
   * @return {Promise} results of the workflow
   **/
  createUpdateDistributionConfig (config: CloudFront.Types.DistributionConfig, action: string): CloudFront.Types.DistributionConfig {
    switch (action) {
      case 'detachEdge':
        return this.detatchEdgeFunction(config)
      case 'attachEdge':
        return this.attatchEdgeFunction(config)
      default:
        return config
    }
  }
  /**
   * Check lambda function arn
   *
   * @param {string} arn - Lambda Arn
   * @return {bool} result
   **/
  protected isTargetLambdaArn (arn: string): boolean {
    if (this.getLambdaArn() === arn) return true
    return false
  }
  /**
   * update distribution config to detach target edge function
   *
   * @param {object} config - CloudFront distribution config
   * @return {object} updated distribution config
   **/
  detatchEdgeFunction (config: CloudFront.Types.DistributionConfig): CloudFront.Types.DistributionConfig {
    const defaultCacheBehavior = config.DefaultCacheBehavior
    const lambdas: CloudFront.Types.LambdaFunctionAssociations = defaultCacheBehavior.LambdaFunctionAssociations || defaultLambdaFunctionAssociations
    if (lambdas.Quantity < 1 || !lambdas.Items) return config
    const newLambdaItems: CloudFront.Types.LambdaFunctionAssociationList = []
    lambdas.Items.forEach(item => {
      if (!item.EventType) return
      if (
        item.EventType === this.eventType &&
        this.isTargetLambdaArn(item.LambdaFunctionARN)
      ) {
        return
      }
      return newLambdaItems.push(item)
    })
    lambdas.Quantity = newLambdaItems.length
    lambdas.Items = newLambdaItems
    config.DefaultCacheBehavior.LambdaFunctionAssociations = lambdas
    return config
  }
  /**
   * update distribution config to attach edge function
   *
   * @param {object} config - CloudFront distribution config
   * @return {object} updated distribution config
   **/
  attatchEdgeFunction (config: CloudFront.Types.DistributionConfig): CloudFront.Types.DistributionConfig {
    const param = this.detatchEdgeFunction(config)
    const defaultCacheBehavior = param.DefaultCacheBehavior
    const lambdas: CloudFront.Types.LambdaFunctionAssociations = defaultCacheBehavior.LambdaFunctionAssociations || defaultLambdaFunctionAssociations
    const newItem = {
      LambdaFunctionARN: this.getLambdaArn(),
      EventType: this.eventType
    }
    if (!lambdas.Items) {
      lambdas.Items = [newItem]
    } else {
      lambdas.Items.push(newItem)
    }
    lambdas.Quantity = lambdas.Items.length
    param.DefaultCacheBehavior.LambdaFunctionAssociations = lambdas
    return param
  }
}

export default LambdaEdgeController