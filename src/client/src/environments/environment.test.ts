import { DEVELOPMENT_MEMBER_TICKET, DEVELOPMENT_POINT_TICKET } from './ticket';

export const environment = {
    production: false,
    PORTAL_SITE_URL: 'http://testtoeiportal.azurewebsites.net',
    APP_SITE_URL: 'https://toei-ticket-test.azurewebsites.net',
    API_ENDPOINT: '',
    FRONTEND_ENDPOINT: 'https://toei-frontend-test.azurewebsites.net',
    ENTRANCE_SERVER_URL: 'https://xxxxx.cloudfront.net',
    MVTK_COMPANY_CODE: 'SSK000',

    COGNITO_REGION: 'ap-northeast-1', // identity poolのリージョンを指定する
    COGNITO_IDENTITY_POOL_ID: 'ap-northeast-1:xxxxxxxxxxxxxxxxxxxxx', // identity poolのID(AWS consoleで確認)
    COGNITO_USER_POOL_ID: '',
    COGNITO_CLIENT_ID: '',

    CINERINO_API_ENDPOINT: 'https://toei-api-test.azurewebsites.net',
    TOKEN_ISSUER: '',

    POINT_TICKET: DEVELOPMENT_POINT_TICKET,

    ANALYTICS_ID: 'UA-99018492-2',

    MEMBER_TICKET: DEVELOPMENT_MEMBER_TICKET, // 毎週木曜1,100円鑑賞の購入枚数上限は1枚だけ
};
