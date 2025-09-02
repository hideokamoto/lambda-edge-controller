import { GetDistributionResult, UpdateDistributionRequest, DistributionConfig, LambdaFunctionAssociations, LambdaFunctionAssociation } from '@aws-sdk/client-cloudfront'
import { EventType } from './models'

export class ConfigUpdator {
  // Lambda function ARN
  private lambdaArn: string

  // Lambda@edge function event type
  private eventType: EventType

  private defaultLambdaFunctionAssociations: LambdaFunctionAssociations

  /**
   * constructor
   *
   * @param {string} lambdaArn - Lambda arn
   * @param {string} [stage='development'] - stage
   **/
  constructor (lambdaArn: string, eventType: EventType = 'viewer-request', defaultLambdaFunctionAssociations: LambdaFunctionAssociations = {
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
  public createUpdateDistributionParam (data: GetDistributionResult, config: DistributionConfig): UpdateDistributionRequest {
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
  public createUpdateDistributionConfig (config: DistributionConfig, action: string): DistributionConfig {
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
  public detatchEdgeFunction (config: DistributionConfig): DistributionConfig {
    const defaultCacheBehavior = config.DefaultCacheBehavior
    if (!defaultCacheBehavior) return config
    const lambdas: LambdaFunctionAssociations = defaultCacheBehavior.LambdaFunctionAssociations || this.defaultLambdaFunctionAssociations
    if (!lambdas.Quantity || lambdas.Quantity < 1 || !lambdas.Items) return config
    const newLambdaItems: LambdaFunctionAssociation[] = []
    lambdas.Items.forEach((item: LambdaFunctionAssociation) => {
      if (!item.EventType) return
      if (
        item.EventType === this.eventType &&
        item.LambdaFunctionARN &&
        this.isTargetLambdaArn(item.LambdaFunctionARN)
      ) {
        return
      }
      return newLambdaItems.push(item)
    })
    lambdas.Quantity = newLambdaItems.length
    lambdas.Items = newLambdaItems
    defaultCacheBehavior.LambdaFunctionAssociations = lambdas
    return config
  }

  /**
   * update distribution config to attach edge function
   *
   * @param {CloudFront.Types.DistributionConfig} config - CloudFront distribution config
   * @return {CloudFront.Types.DistributionConfig} updated distribution config
   **/
  public attatchEdgeFunction (config: DistributionConfig): DistributionConfig {
    const param = this.detatchEdgeFunction(config)
    const defaultCacheBehavior = param.DefaultCacheBehavior
    if (!defaultCacheBehavior) return param
    const lambdas: LambdaFunctionAssociations = defaultCacheBehavior.LambdaFunctionAssociations || this.defaultLambdaFunctionAssociations
    const newItem: LambdaFunctionAssociation = {
      LambdaFunctionARN: this.getLambdaArn(),
      EventType: this.eventType
    }
    if (!lambdas.Items) {
      lambdas.Items = [newItem]
    } else {
      lambdas.Items.push(newItem)
    }
    lambdas.Quantity = lambdas.Items.length
    defaultCacheBehavior.LambdaFunctionAssociations = lambdas
    return param
  }
}

export default ConfigUpdator
