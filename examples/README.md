# Lambda@Edge Controller 使用例

このディレクトリには、`lambda-edge-controller`ライブラリの使用方法を示すサンプルスクリプトが含まれています。

## 📁 ファイル一覧

### `aws-test.js` - 統合テストスクリプト
Lambda@Edge Controllerの全機能をテストする統合スクリプトです。

**実行方法:**
```bash
# ライブラリをビルド
npm run build

# スクリプトを実行
node examples/aws-test.js
# または
cd examples && npm test
```

**特徴:**
- **基本テスト**: 各イベントタイプでのコントローラー作成と設定確認
- **高度なテスト**: カスタムCloudFrontクライアントの設定と動作確認
- **AWS環境テスト**: 実際のCloudFrontディストリビューションでの動作確認
- **統合管理**: 1つのスクリプトで全機能をテスト可能

## 🚀 セットアップ手順

### 1. 依存関係のインストール
```bash
# プロジェクトルートで
npm install
# または
yarn install

# examplesディレクトリで
cd examples
npm install
```

### 2. ライブラリのビルド
```bash
# プロジェクトルートで
npm run build
# または
yarn build
```

### 3. 環境設定ファイルの作成
```bash
cd examples
npm run setup
# または
cp env.example .env
```

### 4. .envファイルの設定
`.env`ファイルを編集して、実際の値を設定してください：

```bash
# 必須設定
LAMBDA_ARN=arn:aws:lambda:us-east-1:123456789012:function:my-function:1
CLOUDFRONT_DISTRIBUTION_ID=E1234567890ABCD

# オプション設定
EVENT_TYPE=viewer-request
AWS_REGION=us-east-1
AWS_PROFILE=default
DEBUG=true
```

## ⚠️ 注意事項

### セキュリティ
- 実際のAWS環境でテストする前に、必ずテスト環境で検証してください
- 本番環境のCloudFrontディストリビューションでテストする際は十分注意してください

### 権限
以下のIAM権限が必要です：
- `cloudfront:GetDistribution`
- `cloudfront:UpdateDistribution`

### リージョン
Lambda@Edgeは`us-east-1`リージョンでのみ利用可能です。

## 🧪 テストの流れ

1. **基本テスト**: 各イベントタイプでのコントローラー作成と設定確認
2. **高度なテスト**: カスタムCloudFrontクライアントの設定と動作確認  
3. **AWS環境テスト**: 実際のCloudFrontディストリビューションでの動作確認

すべてのテストが1つのスクリプト（`aws-test.js`）で順番に実行されます。

## 🔧 トラブルシューティング

### よくあるエラー

**エラー: "No such distribution"**
- CloudFrontディストリビューションIDが正しいか確認
- 適切なIAM権限があるか確認

**エラー: "AWS認証情報が設定されていない"**
- 環境変数またはAWSプロファイルを設定
- IAMロールを使用している場合は適切な権限があるか確認

**エラー: "Lambda ARNが無効"**
- Lambda関数のARNが正しい形式か確認
- 関数が存在し、適切なバージョンが指定されているか確認

## 📚 参考資料

- [Lambda@Edge公式ドキュメント](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-at-the-edge.html)
- [CloudFront API リファレンス](https://docs.aws.amazon.com/cloudfront/latest/APIReference/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/)
