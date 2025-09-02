const { LambdaEdgeController } = require('../dist/index.js');
const { CloudFrontClient } = require('@aws-sdk/client-cloudfront');
const config = require('./config');

// 統合されたLambda@Edge Controller テストスクリプト
async function runAllTests() {
  try {
    console.log('🚀 Lambda@Edge Controller の統合テストを開始します...\n');
    
    // 設定の検証
    try {
      config.validate();
      console.log('✅ 設定の検証が完了しました:');
      console.log(`   Lambda ARN: ${config.lambdaArn}`);
      console.log(`   CloudFront Distribution ID: ${config.distributionId}`);
      console.log(`   イベントタイプ: ${config.eventType}\n`);
    } catch (error) {
      console.error('❌ 設定エラー:', error.message);
      console.log('\n💡 .envファイルの設定を確認してください');
      console.log('   例: cp env.example .env で.envファイルを作成し、実際の値を設定してください');
      return;
    }

    // ===== 1. 基本テスト =====
    console.log('📋 1. 基本テスト - コントローラーの作成と設定確認');
    console.log('-'.repeat(50));
    
    // 各イベントタイプでコントローラーを作成
    const eventTypes = ['viewer-request', 'viewer-response', 'origin-request', 'origin-response'];
    const controllers = {};
    
    for (const eventType of eventTypes) {
      console.log(`\n   📝 ${eventType} イベントタイプでコントローラーを作成中...`);
      
      const lambdaArn = `${config.lambdaArn.replace(/:\d+$/, '')}:${eventType === 'viewer-request' ? '1' : '2'}`;
      const controller = new LambdaEdgeController(lambdaArn, eventType);
      
      // デバッグ設定に応じてログを有効化
      if (config.debug && eventType === 'viewer-request') {
        controller.enableDebugger();
        console.log(`      🔍 デバッグログが有効化されました`);
      }
      
      controllers[eventType] = controller;
      console.log(`      ✅ コントローラーが作成されました`);
      console.log(`         Lambda ARN: ${lambdaArn}`);
      console.log(`         イベントタイプ: ${eventType}`);
    }

    // ===== 2. 高度なテスト =====
    console.log('\n📋 2. 高度なテスト - カスタムCloudFrontクライアントの設定');
    console.log('-'.repeat(50));
    
    try {
      // カスタム設定でCloudFrontクライアントを作成
      const cloudfrontClient = new CloudFrontClient(config.getAwsConfig());
      console.log('   ✅ カスタムCloudFrontクライアントが作成されました');
      console.log(`      AWS設定: ${JSON.stringify(config.getAwsConfig(), null, 2)}`);
    } catch (error) {
      console.error('   ❌ CloudFrontクライアントの作成に失敗しました:', error.message);
    }

    // ===== 3. AWS環境テスト =====
    console.log('\n📋 3. AWS環境テスト - 実際のCloudFrontディストリビューションでの動作確認');
    console.log('-'.repeat(50));
    
    // メインのコントローラーを作成
    const mainController = new LambdaEdgeController(config.lambdaArn, config.eventType);
    
    // デバッグ設定に応じてログを有効化
    if (config.debug) {
      mainController.enableDebugger();
      console.log('   🔍 デバッグログが有効化されました');
    }
    
    console.log('   📋 メインコントローラーが作成されました\n');
    
    // 実際のCloudFrontディストリビューションでテスト
    console.log('   🧪 実際のAWS環境でテストを開始します...\n');
    
    // 現在の設定を確認（アタッチ前）
    console.log('   1️⃣ 現在の設定を確認中...');
    try {
      // 注意: 実際のCloudFrontディストリビューションにアクセスします
      console.log('      ⚠️  実際のCloudFrontディストリビューションにアクセスします');
      console.log('      ⚠️  適切なIAM権限があることを確認してください\n');
      
      /**/
      // 実際のテストを実行する場合は以下のコメントを外してください
      
      // Lambda@Edge関数をアタッチ
      console.log('   2️⃣ Lambda@Edge関数をアタッチ中...');
      const attachResult = await mainController.attachEdgeFunction(config.distributionId);
      console.log('      ✅ アタッチ完了');
      console.log('      📊 結果:', JSON.stringify(attachResult, null, 2));
      
      // 少し待機（CloudFrontの更新には時間がかかります）
      console.log('\n   3️⃣ CloudFrontの更新完了を待機中...（数分かかる場合があります）');
      await new Promise(resolve => setTimeout(resolve, 30000)); // 30秒待機
      
      // Lambda@Edge関数をデタッチ
      console.log('\n   4️⃣ Lambda@Edge関数をデタッチ中...');
      const detachResult = await mainController.detachEdgeFunction(config.distributionId);
      console.log('      ✅ デタッチ完了');
      console.log('      📊 結果:', JSON.stringify(detachResult, null, 2));
      /**/
      
      console.log('      📝 実際のテストを実行するには、上記のコメントアウトされたコードを有効化してください');
      
    } catch (error) {
      console.error('      ❌ テスト実行中にエラーが発生しました:', error.message);
      console.error('      💡 考えられる原因:');
      console.error('         - IAM権限が不足している');
      console.error('         - CloudFrontディストリビューションIDが無効');
      console.error('         - Lambda関数ARNが無効');
      console.error('         - AWS認証情報が設定されていない');
    }
    
    console.log('\n🎉 すべてのテストが完了しました！');
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    console.error('\n💡 .envファイルの設定を確認してください');
    console.error('   例: cp env.example .env で.envファイルを作成し、実際の値を設定してください');
  }
}

// 環境変数の設定状況を確認
function checkEnvironment() {
  console.log('🔍 設定状況を確認中...\n');
  
  // 設定クラスの表示メソッドを使用
  config.display();
}

// スクリプトを実行
if (require.main === module) {
  checkEnvironment();
  console.log('\n' + '='.repeat(60) + '\n');
  runAllTests();
}

module.exports = { runAllTests, checkEnvironment };
