const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// 設定値を管理するクラス
class Config {
  constructor() {
    this.loadEnvironmentVariables();
  }

  // 環境変数を読み込み
  loadEnvironmentVariables() {
    // 必須設定
    this.lambdaArn = process.env.LAMBDA_ARN;
    this.distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID;
    
    // オプション設定
    this.eventType = process.env.EVENT_TYPE || 'viewer-request';
    this.awsRegion = process.env.AWS_REGION || 'us-east-1';
    this.awsProfile = process.env.AWS_PROFILE;
    
    // AWS認証情報
    this.awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
    this.awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    this.awsSessionToken = process.env.AWS_SESSION_TOKEN;
    
    // デバッグ設定
    this.debug = process.env.DEBUG === 'true';
    this.logLevel = process.env.LOG_LEVEL || 'info';
  }

  // 必須設定が揃っているかチェック
  validate() {
    const errors = [];
    
    if (!this.lambdaArn) {
      errors.push('LAMBDA_ARN が設定されていません');
    }
    
    if (!this.distributionId) {
      errors.push('CLOUDFRONT_DISTRIBUTION_ID が設定されていません');
    }
    
    if (errors.length > 0) {
      throw new Error(`設定エラー:\n${errors.map(err => `  - ${err}`).join('\n')}`);
    }
    
    return true;
  }

  // 設定状況を表示
  display() {
    console.log('🔍 現在の設定状況:');
    console.log('');
    
    console.log('必須設定:');
    console.log(`  LAMBDA_ARN: ${this.lambdaArn ? '✅ 設定済み' : '❌ 未設定'}`);
    console.log(`  CLOUDFRONT_DISTRIBUTION_ID: ${this.distributionId ? '✅ 設定済み' : '❌ 未設定'}`);
    console.log('');
    
    console.log('オプション設定:');
    console.log(`  EVENT_TYPE: ${this.eventType}`);
    console.log(`  AWS_REGION: ${this.awsRegion}`);
    console.log(`  AWS_PROFILE: ${this.awsProfile || '未設定'}`);
    console.log(`  DEBUG: ${this.debug}`);
    console.log(`  LOG_LEVEL: ${this.logLevel}`);
    console.log('');
    
    console.log('AWS認証情報:');
    if (this.awsAccessKeyId && this.awsSecretAccessKey) {
      console.log('  ✅ 環境変数で設定済み');
    } else if (this.awsProfile) {
      console.log(`  ✅ AWSプロファイル: ${this.awsProfile}`);
    } else {
      console.log('  ⚠️  未設定（IAMロールまたはプロファイルを使用してください）');
    }
  }

  // AWS SDK設定オブジェクトを取得
  getAwsConfig() {
    const config = {
      region: this.awsRegion
    };
    
    if (this.awsAccessKeyId && this.awsSecretAccessKey) {
      config.credentials = {
        accessKeyId: this.awsAccessKeyId,
        secretAccessKey: this.awsSecretAccessKey
      };
      
      if (this.awsSessionToken) {
        config.credentials.sessionToken = this.awsSessionToken;
      }
    }
    
    if (this.awsProfile) {
      config.profile = this.awsProfile;
    }
    
    return config;
  }
}

// シングルトンインスタンスを作成
const config = new Config();

module.exports = config;
