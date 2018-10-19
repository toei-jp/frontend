# Features


# Usage

## Environment variables

| Name                                | Required | Value            | Purpose                                 |
|-------------------------------------|----------|------------------|-----------------------------------------|
| `NODE_ENV`                          | true     |                  | 環境名                                  |
| `NPM_TOKEN`                         | true     |                  | npm トークン                            |
| `REDIS_HOST`                        | true     |                  | REDISホスト                             |
| `REDIS_PORT`                        | true     |                  | REDISポート                             |
| `REDIS_KEY`                         | true     |                  | REDISキー                              |
| `CINERINO_API_ENDPOINT`             | true     |                  | CINERINO API エンドポイント              |
| `CIERINO_CLIENT_ID`                 | true     |                  | クライアントID                           |
| `CINERINO_CLIENT_SECRET`            | true     |                  | クライアントSECRET                       |
| `CINERINO_AUTHORIZE_SERVER_DOMAIN`  | true     |                  | 認可サーバードメイン                     |
| `CINERINO_RESOURCE_SERVER_URL`      | true     |                  | リソースサーバーURL                    |
| `PORTAL_SITE_URL`                   | true     |                  | ポータルサイトURL                        |
| `APP_SITE_URL`                      | true     |                  | スマホアプリURL                          |
| `ALLOWED_IPS`                       | false    |                  | IP制限IPリスト(カンマ区切り)              |
| `BASIC_AUTH_NAME`                   | false    |                  | ベーシック認証ID                         |
| `BASIC_AUTH_PASS`                   | false    |                  | ベーシック認証PASS                       |
| `WHITELIST`                         | false    |                  | XHR、iframeリクエスト許可(カンマ区切り)   |
| `HIDE_THEATERS`                     | false    |                  | スケジュール取得API非表示劇場(カンマ区切り)   |
| `DEBUG`                             | false    |  toei-frontend:* | デバッグ                                |

## Azure Environment variables

| Name                                | Required | Value            | Purpose                                 |
|-------------------------------------|----------|------------------|-----------------------------------------|
| `WEBSITE_NODE_DEFAULT_VERSION`      | true     |                  | node.jsバージョン                        |
| `WEBSITE_TIME_ZONE`                 | true     |                  | タイムゾーン設定(Tokyo Standard Time)     |


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
