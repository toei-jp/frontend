# Features


# Usage

## Environment variables

| Name                                | Required | Value            | Purpose                                 |
|-------------------------------------|----------|------------------|-----------------------------------------|
| `NODE_ENV`                          | true     |                  | 環境名                                  |
| `REDIS_HOST`                        | true     |                  | REDISホスト                             |
| `REDIS_PORT`                        | true     |                  | REDISポート                             |
| `REDIS_KEY`                         | true     |                  | REDISキー                              |
| `CINERINO_API_ENDPOINT`             | true     |                  | CINERINO API エンドポイント              |
| `CIERINO_CLIENT_ID`                 | true     |                  | クライアントID                           |
| `CINERINO_CLIENT_SECRET`            | true     |                  | クライアントSECRET                       |
| `CINERINO_AUTHORIZE_SERVER_DOMAIN`  | true     |                  | 認可サーバードメイン                     |
| `CINERINO_RESOURCE_SERVER_URL`      | true     |                  | リソースサーバーURL                    |
| `PORTAL_SITE_URL`                   | true     |                  | ポータルサイトURL                        |
| `ALLOWED_IPS`                       | false    |                  | IP制限IPリスト(カンマ区切り)              |
| `BASIC_AUTH_NAME`                   | false    |                  | ベーシック認証ID                         |
| `BASIC_AUTH_PASS`                   | false    |                  | ベーシック認証PASS                       |
| `DEBUG`                             | false    |  toei-frontend:* | デバッグ                                |
| `PROJECT_ID`                        | true     |                  | プロジェクトID                          |

# Build

ビルドは以下で実行できます。

```shell
npm run build
```

# Tests

構文チェックは以下で実行できます。

```shell
npm run check
```

<!-- UIテストは以下で実行できます。

```shell
npm ui-test
``` -->

<!-- # JsDoc

```shell
npm run jsdoc
```

`jsdocを作成できます。./docsに出力されます。 -->
