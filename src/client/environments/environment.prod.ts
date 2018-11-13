import { PRODUCTION_MEMBER_TICKET, PRODUCTION_POINT_TICKET } from './ticket';

export const environment = {
    production: true,
    PORTAL_SITE_URL: '/',
    APP_SITE_URL: 'https://smpapp.ticket-toei.co.jp',
    API_ENDPOINT: '',
    FRONTEND_ENDPOINT: '',
    ENTRANCE_SERVER_URL: 'https://entrance.ticket-toei.co.jp',
    MVTK_COMPANY_CODE: 'SSK000',

    COGNITO_REGION: 'ap-northeast-1', // identity poolのリージョンを指定する
    COGNITO_IDENTITY_POOL_ID: 'ap-northeast-1:xxxxxxxxxxxxxxxxxxxxxxx', // identity poolのID(AWS consoleで確認)
    COGNITO_USER_POOL_ID: '',
    COGNITO_CLIENT_ID: '',

    CINERINO_API_ENDPOINT: 'https://toei-cinerino-api-production.azurewebsites.net',
    TOKEN_ISSUER: '',

    POINT_TICKET: PRODUCTION_POINT_TICKET,

    ANALYTICS_ID: 'UA-8383230-1',

    MEMBER_TICKET: PRODUCTION_MEMBER_TICKET, // 毎週木曜1,100円鑑賞の購入枚数上限は1枚だけ
};
