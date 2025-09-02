# Lambda@Edge Function Controller

CloudFrontディストリビューションでAWS Lambda@Edge関数を管理するためのシンプルで効率的なコントローラーです。

## 概要

Lambda@Edge Function Controllerは、CloudFrontディストリビューションにLambda@Edge関数を簡単にアタッチ/デタッチするためのTypeScriptライブラリです。複雑なCloudFront設定の更新を自動的に処理し、CDNセットアップでエッジ関数を簡単に管理できるようにします。

## 特徴

- **シンプルなAPI**: Lambda@Edge関数のアタッチ/デタッチが簡単
- **イベントタイプ対応**: すべてのLambda@Edgeイベントタイプをサポート（viewer-request, viewer-response, origin-request, origin-response）
- **自動設定**: CloudFrontディストリビューション設定の自動生成と更新
- **TypeScript対応**: 包括的な型定義による完全なTypeScriptサポート
- **AWS SDK v3**: 最新のAWS SDK for JavaScript v3で構築
- **ログ機能**: デバッグとモニタリングのためのBunyanによる組み込みログ
- **柔軟な設定**: カスタムAWSクライアントと設定のサポート

## ユースケース

- **A/Bテスト**: テスト用に異なるLambda@Edge関数を素早く切り替え
- **フィーチャーフラグ**: 再デプロイなしでエッジの機能を有効/無効化
- **セキュリティ更新**: エッジ関数にセキュリティパッチを迅速にデプロイ
- **パフォーマンス最適化**: 異なるエッジ関数設定をテスト
- **開発ワークフロー**: 異なる環境間でエッジ関数を管理
- **災害復旧**: 以前のエッジ関数バージョンに素早くロールバック

## インストール

```bash
npm install lambda-edge-controller
# または
yarn add lambda-edge-controller
```

## クイックスタート

### 基本的な使用方法

```typescript
import { LambdaEdgeController } from 'lambda-edge-controller';

// コントローラーインスタンスを作成
const controller = new LambdaEdgeController(
  'arn:aws:lambda:us-east-1:123456789012:function:my-edge-function:1',
  'viewer-request'
);

// Lambda@Edge関数をCloudFrontディストリビューションにアタッチ
await controller.attachEdgeFunction('E1234567890ABCD');

// Lambda@Edge関数をCloudFrontディストリビューションからデタッチ
await controller.detachEdgeFunction('E1234567890ABCD');
```

### カスタム設定を使用した高度な使用方法

```typescript
import { LambdaEdgeController } from 'lambda-edge-controller';
import { CloudFrontClient } from '@aws-sdk/client-cloudfront';

// カスタムCloudFrontクライアントを作成
const cloudfrontClient = new CloudFrontClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'YOUR_ACCESS_KEY',
    secretAccessKey: 'YOUR_SECRET_KEY'
  }
});

// カスタムクライアントでコントローラーを作成
const controller = new LambdaEdgeController(
  'arn:aws:lambda:us-east-1:123456789012:function:my-edge-function:1',
  'viewer-request',
  { cloudfront: cloudfrontClient }
);

// デバッグログを有効化
controller.enableDebugger();

// エッジ関数をアタッチ
await controller.attachEdgeFunction('E1234567890ABCD');
```

## APIリファレンス

### コンストラクター

```typescript
new LambdaEdgeController(
  lambdaArn: string,
  eventType?: EventType,
  client?: ControllerClient
)
```

**パラメーター:**
- `lambdaArn`: Lambda@Edge関数のARN
- `eventType`: CloudFrontイベントタイプ（デフォルト: 'viewer-request'）
- `client`: オプションのカスタムAWSクライアント

**イベントタイプ:**
- `viewer-request`: CloudFrontがオリジンにリクエストを転送する前に実行
- `viewer-response`: CloudFrontがビューアーにレスポンスを返す前に実行
- `origin-request`: CloudFrontがオリジンにリクエストを転送する前に実行
- `origin-response`: CloudFrontがオリジンからレスポンスを受信した後に実行

### メソッド

#### `attachEdgeFunction(distributionId: string): Promise<any>`
指定されたCloudFrontディストリビューションにLambda@Edge関数をアタッチします。

#### `detachEdgeFunction(distributionId: string): Promise<any>`
指定されたCloudFrontディストリビューションからLambda@Edge関数を削除します。

#### `enableDebugger(): this`
デバッグ目的で詳細なログを有効化します。

#### `disableDebugger(): this`
詳細なログを無効化します。

## 例とテスト

このプロジェクトには、`examples/`ディレクトリに包括的な例とテストユーティリティが含まれています。

### テスト用セットアップ

1. **依存関係のインストール:**
```bash
# プロジェクト依存関係のインストール
npm install

# 例の依存関係のインストール
cd examples
npm install
```

2. **ライブラリのビルド:**
```bash
# プロジェクトルートから
npm run build
```

3. **環境設定:**
```bash
cd examples
npm run setup
# これでenv.exampleから.envファイルが作成されます
```

4. **.envファイルの編集:**
```bash
# 必須設定
LAMBDA_ARN=arn:aws:lambda:us-east-1:123456789012:function:my-edge-function:1
CLOUDFRONT_DISTRIBUTION_ID=E1234567890ABCD

# オプション設定
EVENT_TYPE=viewer-request
AWS_REGION=us-east-1
AWS_PROFILE=default
DEBUG=true
```

### テストの実行

#### ユニットテスト
```bash
# すべてのユニットテストを実行
npm test

# ウォッチモードでテストを実行
npm run test:watch

# カバレッジ付きでテストを実行
npm run test:dev
```

#### 統合テスト
```bash
# 包括的な統合テストを実行
cd examples
npm test

# または直接実行
node aws-test.js
```

#### 手動テスト
```bash
# 特定の機能をテスト
node -e "
const { LambdaEdgeController } = require('../dist/index.js');
const controller = new LambdaEdgeController('your-lambda-arn', 'viewer-request');
console.log('コントローラーが正常に作成されました');
"
```

### テストカバレッジ

examplesディレクトリは以下を提供します：

- **基本テスト**: コントローラーの作成と設定検証
- **高度なテスト**: カスタムAWSクライアント設定
- **統合テスト**: 実際のAWS環境でのテスト
- **エラーハンドリング**: 包括的なエラーシナリオ
- **設定検証**: 環境セットアップの検証

## 開発

### 前提条件

- Node.js >= 14.0.0
- CloudFront権限を持つAWS認証情報
- TypeScriptの知識

### 開発コマンド

```bash
# 依存関係のインストール
npm install

# リンターの実行
npm run lint
npm run lint --fix

# テストの実行
npm test
npm run test:watch

# ビルド
npm run build

# ドキュメントの生成
npm run doc
```

### 必要なIAM権限

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

## アーキテクチャ

このライブラリは3つの主要コンポーネントで構成されています：

1. **LambdaEdgeController**: エッジ関数を管理するメインコントローラークラス
2. **ConfigUpdator**: CloudFront設定更新を処理
3. **Models**: TypeScriptインターフェースとタイプ

### クラス図

```
LambdaEdgeController
├── CloudFrontClient (AWS SDK)
├── ConfigUpdator
└── Logger (Bunyan)

ConfigUpdator
├── Lambda ARN管理
├── イベントタイプ処理
└── ディストリビューション設定更新
```

## コントリビューション

1. リポジトリをフォーク
2. フィーチャーブランチを作成
3. コミットメッセージの規則に従う（Conventional Commits）
4. テストとリンターを実行
5. プルリクエストを提出

### コミットメッセージ形式

```bash
git commit -m "<type>[optional scope]: <description>

[optional body]

[optional footer]"
```

**タイプ:**
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント変更
- `style`: コードスタイル変更
- `refactor`: コードリファクタリング
- `test`: テストの追加または更新
- `chore`: メンテナンスタスク

## ライセンス

MITライセンス - 詳細は[LICENSE](LICENSE)ファイルを参照してください。

## サポート

- **Issues**: [GitHub Issues](https://github.com/hideokamoto/lambda-edge-controller/issues)
- **ドキュメント**: [生成されたドキュメント](./docs/)
- **例**: [例ディレクトリ](./examples/)

## 関連リンク

- [AWS Lambda@Edge ドキュメント](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-at-the-edge.html)
- [CloudFront API リファレンス](https://docs.aws.amazon.com/cloudfront/latest/APIReference/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**English version**: [README.md](README.md)
