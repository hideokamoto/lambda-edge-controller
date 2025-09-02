module.exports = {
  CloudFrontClient: class MockCloudFrontClient {
    constructor(config) {
      this.config = config;
    }
    
    send(command) {
      return Promise.resolve({
        Distribution: {
          Id: 'test-distribution-id',
          DistributionConfig: {
            DefaultCacheBehavior: {
              LambdaFunctionAssociations: {
                Quantity: 0,
                Items: []
              }
            }
          }
        }
      });
    }
  },
  
  GetDistributionCommand: class MockGetDistributionCommand {
    constructor(params) {
      this.params = params;
    }
  },
  
  UpdateDistributionCommand: class MockUpdateDistributionCommand {
    constructor(params) {
      this.params = params;
    }
  }
};
