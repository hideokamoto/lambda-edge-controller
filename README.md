# Lambda@Edge Function Controller

A simple and efficient controller for managing AWS Lambda@Edge functions in CloudFront distributions.

## Overview

Lambda@Edge Function Controller is a TypeScript library that provides a clean API for attaching and detaching Lambda@Edge functions to/from CloudFront distributions. It handles the complex CloudFront configuration updates automatically, making it easy to manage edge functions in your CDN setup.

## Features

- **Simple API**: Easy-to-use methods for attaching and detaching Lambda@Edge functions
- **Event Type Support**: Supports all Lambda@Edge event types (viewer-request, viewer-response, origin-request, origin-response)
- **Automatic Configuration**: Automatically generates and updates CloudFront distribution configurations
- **TypeScript Support**: Full TypeScript support with comprehensive type definitions
- **AWS SDK v3**: Built with the latest AWS SDK for JavaScript v3
- **Logging**: Built-in logging with Bunyan for debugging and monitoring
- **Flexible Configuration**: Support for custom AWS clients and configurations

## Use Cases

- **A/B Testing**: Quickly switch between different Lambda@Edge functions for testing
- **Feature Flags**: Enable/disable features at the edge without redeploying
- **Security Updates**: Rapidly deploy security patches to edge functions
- **Performance Optimization**: Test different edge function configurations
- **Development Workflow**: Manage edge functions across different environments
- **Disaster Recovery**: Quickly rollback to previous edge function versions

## Installation

```bash
npm install lambda-edge-controller
# or
yarn add lambda-edge-controller
```

## Quick Start

### Basic Usage

```typescript
import { LambdaEdgeController } from 'lambda-edge-controller';

// Create a controller instance
const controller = new LambdaEdgeController(
  'arn:aws:lambda:us-east-1:123456789012:function:my-edge-function:1',
  'viewer-request'
);

// Attach the Lambda@Edge function to a CloudFront distribution
await controller.attachEdgeFunction('E1234567890ABCD');

// Detach the Lambda@Edge function from a CloudFront distribution
await controller.detachEdgeFunction('E1234567890ABCD');
```

### Advanced Usage with Custom Configuration

```typescript
import { LambdaEdgeController } from 'lambda-edge-controller';
import { CloudFrontClient } from '@aws-sdk/client-cloudfront';

// Create a custom CloudFront client
const cloudfrontClient = new CloudFrontClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'YOUR_ACCESS_KEY',
    secretAccessKey: 'YOUR_SECRET_KEY'
  }
});

// Create controller with custom client
const controller = new LambdaEdgeController(
  'arn:aws:lambda:us-east-1:123456789012:function:my-edge-function:1',
  'viewer-request',
  { cloudfront: cloudfrontClient }
);

// Enable debug logging
controller.enableDebugger();

// Attach edge function
await controller.attachEdgeFunction('E1234567890ABCD');
```

## API Reference

### Constructor

```typescript
new LambdaEdgeController(
  lambdaArn: string,
  eventType?: EventType,
  client?: ControllerClient
)
```

**Parameters:**
- `lambdaArn`: The ARN of your Lambda@Edge function
- `eventType`: The CloudFront event type (default: 'viewer-request')
- `client`: Optional custom AWS clients

**Event Types:**
- `viewer-request`: Function executes before CloudFront forwards a request to the origin
- `viewer-response`: Function executes before CloudFront returns the response to the viewer
- `origin-request`: Function executes before CloudFront forwards the request to the origin
- `origin-response`: Function executes after CloudFront receives the response from the origin

### Methods

#### `attachEdgeFunction(distributionId: string): Promise<any>`
Attaches the Lambda@Edge function to the specified CloudFront distribution.

#### `detachEdgeFunction(distributionId: string): Promise<any>`
Removes the Lambda@Edge function from the specified CloudFront distribution.

#### `enableDebugger(): this`
Enables detailed logging for debugging purposes.

#### `disableDebugger(): this`
Disables detailed logging.

## Testing with Examples

The project includes comprehensive examples and testing utilities in the `examples/` directory.

### Setup for Testing

1. **Install dependencies:**
```bash
# Install project dependencies
npm install

# Install examples dependencies
cd examples
npm install
```

2. **Build the library:**
```bash
# From project root
npm run build
```

3. **Configure environment:**
```bash
cd examples
npm run setup
# This creates a .env file from env.example
```

4. **Edit .env file:**
```bash
# Required settings
LAMBDA_ARN=arn:aws:lambda:us-east-1:123456789012:function:my-edge-function:1
CLOUDFRONT_DISTRIBUTION_ID=E1234567890ABCD

# Optional settings
EVENT_TYPE=viewer-request
AWS_REGION=us-east-1
AWS_PROFILE=default
DEBUG=true
```

### Running Tests

#### Unit Tests
```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:dev
```

#### Integration Tests
```bash
# Run the comprehensive integration test
cd examples
npm test

# Or directly
node aws-test.js
```

#### Manual Testing
```bash
# Test specific functionality
node -e "
const { LambdaEdgeController } = require('../dist/index.js');
const controller = new LambdaEdgeController('your-lambda-arn', 'viewer-request');
console.log('Controller created successfully');
"
```

### Test Coverage

The examples directory provides:

- **Basic Tests**: Controller creation and configuration validation
- **Advanced Tests**: Custom AWS client configuration
- **Integration Tests**: Real AWS environment testing
- **Error Handling**: Comprehensive error scenarios
- **Configuration Validation**: Environment setup verification

## Development

### Prerequisites

- Node.js >= 14.0.0
- AWS credentials with CloudFront permissions
- TypeScript knowledge

### Development Commands

```bash
# Install dependencies
npm install

# Run linter
npm run lint
npm run lint --fix

# Run tests
npm test
npm run test:watch

# Build
npm run build

# Generate documentation
npm run doc
```

### Required IAM Permissions

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:GetDistribution",
        "cloudfront:UpdateDistribution"
      ],
      "Resource": "*"
    }
  ]
}
```

## Release Process

### Prerequisites

- All changes committed and pushed to remote repository
- GitHub access token configured for `conventional-github-releaser`
- npm account access for publishing

### Release Steps

1. **Commit and push changes:**
```bash
git add .
git commit -m "feat: add new feature"  # Use conventional commit format
git push origin main
```

2. **Build the library:**
```bash
npm run build
```

3. **Update version and create release:**
```bash
npm version patch  # or minor, major
```
This command automatically:
- Updates version in `package.json`
- Creates Git tag
- Pushes tag to remote repository
- Creates GitHub release
- Updates `CHANGELOG.md`

4. **Verify release artifacts:**
```bash
# Check if tag was created
git tag -l | tail -3

# Check if CHANGELOG was updated
git log --oneline -2
```

5. **Publish to npm:**
```bash
npm publish
```

### Version Management

- **patch**: Bug fixes and minor updates (1.2.1 → 1.2.2)
- **minor**: New features (1.2.1 → 1.3.0)
- **major**: Breaking changes (1.2.1 → 2.0.0)

### Automated Processes

The release process uses several npm scripts that run automatically:

- **`postversion`**: Automatically executes after `npm version`
- **`push:tag`**: Pushes Git tag to remote repository
- **`create:release`**: Creates GitHub release with conventional changelog
- **`create:changelog`**: Updates local `CHANGELOG.md` file

### Troubleshooting

If the automated release process fails:

```bash
# Manually execute release scripts
npm run push:tag
npm run create:release
npm run create:changelog
```

Check GitHub repository settings and ensure proper authentication tokens are configured.

## Architecture

The library consists of three main components:

1. **LambdaEdgeController**: Main controller class for managing edge functions
2. **ConfigUpdator**: Handles CloudFront configuration updates
3. **Models**: TypeScript interfaces and types

### Class Diagram

```
LambdaEdgeController
├── CloudFrontClient (AWS SDK)
├── ConfigUpdator
└── Logger (Bunyan)

ConfigUpdator
├── Lambda ARN management
├── Event type handling
└── Distribution config updates
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the commit message convention (Conventional Commits)
4. Run tests and linting
5. Submit a pull request

### Commit Message Format

```bash
git commit -m "<type>[optional scope]: <description>

[optional body]

[optional footer]"
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/hideokamoto/lambda-edge-controller/issues)
- **Documentation**: [Generated Docs](./docs/)
- **Examples**: [Examples Directory](./examples/)

## Related Links

- [AWS Lambda@Edge Documentation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-at-the-edge.html)
- [CloudFront API Reference](https://docs.aws.amazon.com/cloudfront/latest/APIReference/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**日本語版**: [README_ja.md](README_ja.md)