import { CloudFront } from 'aws-sdk'
import { EventType } from './models'
import Types = CloudFront.Types

export class ConfigUpdator {
  // Lambda function ARN
  private lambdaArn: string

  // Lambda@edge function event type
  private eventType: EventType

  private defaultLambdaFunctionAssociations: Types.LambdaFunctionAssociations

  /**
   * constructor
   *
   * @param {string} lambdaArn - Lambda arn
   * @param {string} [stage='development'] - stage
   **/
  constructor (lambdaArn: string, eventType: EventType = 'viewer-request', defaultLambdaFunctionAssociations: Types.LambdaFunctionAssociations = {
    Quantity: 0,
    Items: []
  }) {
    this.lambdaArn = lambdaArn
    this.eventType = eventType
    this.defaultLambdaFunctionAssociations = defaultLambdaFunctionAssociations
  }

  /**
   * get lambda arn
   *
   * @return {string} lambda arn
   **/
  public getLambdaArn (): string {
    return this.lambdaArn
  }

  /**
   * Update Lambda@edge function event type
   * @param {CloudFront.EventType} type
   */
  public updateEventType (type: EventType): this {
    this.eventType = type
    return this
  }

  /**
   * Get target event type
   * @return {CloudFront.EventType}
   */
  public getTargetEventType (): EventType {
    return this.eventType
  }

  /**
   * Generate update CloudFront distribution params
   *
   * @param {CloudFront.GetDistributionResult} data - cloudfront.getCloudFrontDistribution results
   * @param {CloudFront.Types.DistributionConfig} config - updated distribution config
   * @return {CloudFront.UpdateDistributionRequest} update distribution param
   **/
  public createUpdateDistributionParam (data: CloudFront.GetDistributionResult, config: Types.DistributionConfig): CloudFront.UpdateDistributionRequest {
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
   * @param {CloudFront.Types.DistributionConfig} distribution - CloudFront distribution data
   * @param {'detachEdge' | 'attachEdge'} action - update action type
   * @return {CloudFront.Types.DistributionConfig} config
   **/
  public createUpdateDistributionConfig (config: Types.DistributionConfig, action: string): Types.DistributionConfig {
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
  public isTargetLambdaArn (arn: string): boolean {
    if (this.getLambdaArn() === arn) return true
    return false
  }

  /**
   * update distribution config to detach target edge function
   *
   * @param {CloudFront.Types.DistributionConfig} config - CloudFront distribution config
   * @return {CloudFront.Types.DistributionConfig} updated distribution config
   **/
  public detatchEdgeFunction (config: Types.DistributionConfig): Types.DistributionConfig {
    const defaultCacheBehavior = config.DefaultCacheBehavior
    const lambdas: Types.LambdaFunctionAssociations = defaultCacheBehavior.LambdaFunctionAssociations || this.defaultLambdaFunctionAssociations
    if (lambdas.Quantity < 1 || !lambdas.Items) return config
    const newLambdaItems: Types.LambdaFunctionAssociationList = []
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
   * @param {CloudFront.Types.DistributionConfig} config - CloudFront distribution config
   * @return {CloudFront.Types.DistributionConfig} updated distribution config
   **/
  public attatchEdgeFunction (config: Types.DistributionConfig): Types.DistributionConfig {
    const param = this.detatchEdgeFunction(config)
    const defaultCacheBehavior = param.DefaultCacheBehavior
    const lambdas: Types.LambdaFunctionAssociations = defaultCacheBehavior.LambdaFunctionAssociations || this.defaultLambdaFunctionAssociations
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

export default ConfigUpdator
