/**
 * AWS SDK v3 CloudFront Client Mock
 * 
 * WHY THIS MOCK EXISTS:
 * This mock was created to resolve Jest module resolution issues when migrating from AWS SDK v2 to v3.
 * The older Jest version (24.9.0) and ts-jest (24.0.2) cannot properly resolve Node.js built-in modules
 * like 'node:stream' that AWS SDK v3 uses internally, causing test failures with errors like:
 * "Cannot find module 'node:stream' from 'createBufferedReadable.js'"
 * 
 * WHAT THE IDEAL SOLUTION SHOULD BE:
 * Instead of using this mock, the testing infrastructure should be updated to properly support
 * AWS SDK v3's module resolution patterns. This would involve:
 * 1. Upgrading Jest to a modern version (>=27.x) that supports Node.js built-in module resolution
 * 2. Upgrading ts-jest to a compatible version (>=27.x)
 * 3. Updating Node.js version in CI/CD to >=14.x (already done in package.json engines)
 * 4. Configuring Jest with proper ESM support if needed
 * 
 * WHEN THIS FILE CAN BE REMOVED:
 * This mock can be safely deleted when ALL of the following conditions are met:
 * 1. Jest is upgraded to version 27.x or higher
 * 2. ts-jest is upgraded to a compatible version (27.x or higher)
 * 3. All tests pass without this mock file present
 * 4. The real AWS SDK v3 client can be imported and used in the test environment
 * 
 * To test if this mock is still needed:
 * 1. Delete this file temporarily
 * 2. Run `yarn test`
 * 3. If tests pass, the mock is no longer needed
 * 4. If tests fail with module resolution errors, the mock is still required
 * 
 * TECHNICAL DEBT:
 * This mock represents technical debt that should be addressed in a future dependency update cycle.
 * The mock provides basic functionality for testing but doesn't validate actual AWS SDK v3 behavior.
 */

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
