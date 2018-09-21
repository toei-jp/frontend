import { DEVELOPMENT_MEMBER_TICKET, DEVELOPMENT_POINT_TICKET } from './ticket';

export const environment = {
    production: false,
    PORTAL_SITE_URL: '/#/purchase/schedule',
    APP_SITE_URL: 'https://localhost:3333',
    API_ENDPOINT: 'https://localhost',
    FRONTEND_ENDPOINT: '',
    ENTRANCE_SERVER_URL: 'https://xxxx.cloudfront.net',
    MVTK_COMPANY_CODE: 'SSK000',

    COGNITO_REGION: 'ap-northeast-1', // identity poolのリージョンを指定する
    COGNITO_IDENTITY_POOL_ID: 'ap-northeast-1:6a67f523-93c3-4766-b96f-6552f21abd8d', // identity poolのID(AWS consoleで確認)
    COGNITO_USER_POOL_ID: '',
    COGNITO_CLIENT_ID: '',

    CINERINO_API_ENDPOINT: 'https://toei-api-development.azurewebsites.net',
    TOKEN_ISSUER: '',

    POINT_TICKET: DEVELOPMENT_POINT_TICKET,

    ANALYTICS_ID: 'UA-99018492-2',

    MEMBER_TICKET: DEVELOPMENT_MEMBER_TICKET, // 毎週木曜1,100円鑑賞の購入枚数上限は1枚だけ
};
