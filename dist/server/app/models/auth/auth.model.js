"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cinerino = require("@toei-jp/cinerino-api-nodejs-client");
const uuid = require("uuid");
/**
 * ApiEndpointを確定のため
 * @enum ApiEndpoint
 */
var ApiEndpoint;
(function (ApiEndpoint) {
    ApiEndpoint["cinerino"] = "cinerino";
    ApiEndpoint["chevre"] = "chevre";
})(ApiEndpoint = exports.ApiEndpoint || (exports.ApiEndpoint = {}));
/**
 * 認証モデル
 * @class AuthModel
 */
class AuthModel {
    /**
     * @constructor
     * @param {any} session
     */
    constructor(session, apiEndpoint) {
        this.apiEndpoint = apiEndpoint;
        if (session === undefined) {
            session = {};
        }
        this.state = (session.state !== undefined) ? session.state : uuid.v1();
        let resourceServerUrl;
        if (apiEndpoint === ApiEndpoint.chevre) {
            resourceServerUrl = process.env.CHEVRE_RESOURCE_SERVER_URL;
        }
        else {
            resourceServerUrl = process.env.CINERINO_RESOURCE_SERVER_URL;
        }
        this.scopes = (session.scopes !== undefined) ? session.scopes : [
            `${resourceServerUrl}/transactions`,
            `${resourceServerUrl}/events.read-only`,
            `${resourceServerUrl}/organizations.read-only`,
            `${resourceServerUrl}/orders.read-only`,
            `${resourceServerUrl}/places.read-only`
        ];
        this.credentials = session.credentials;
        this.codeVerifier = session.codeVerifier;
    }
    /**
     * 認証クラス作成
     * @memberof AuthModel
     * @method create
     * @returns {cinerino.auth.ClientCredentials}
     */
    create() {
        switch (this.apiEndpoint) {
            case ApiEndpoint.chevre:
                return new cinerino.auth.ClientCredentials({
                    domain: process.env.CHEVRE_AUTHORIZE_SERVER_DOMAIN,
                    clientId: process.env.CHEVRE_CLIENT_ID,
                    clientSecret: process.env.CHEVRE_CLIENT_SECRET,
                    state: this.state,
                    scopes: this.scopes
                });
            default:
                return new cinerino.auth.ClientCredentials({
                    domain: process.env.CINERINO_AUTHORIZE_SERVER_DOMAIN,
                    clientId: process.env.CINERINO_CLIENT_ID,
                    clientSecret: process.env.CINERINO_CLIENT_SECRET,
                    state: this.state,
                    scopes: this.scopes
                });
        }
    }
    /**
     * セッションへ保存
     * @memberof AuthModel
     * @method save
     * @returns {Object}
     */
    save(session, apiEndpoint) {
        const authSession = {
            state: this.state,
            scopes: this.scopes,
            credentials: this.credentials,
            codeVerifier: this.codeVerifier,
            api: apiEndpoint
        };
        if (session.auth === undefined) {
            session.auth = [authSession];
            return;
        }
        for (let i = 0; i < session.auth.length; i++) {
            if (session.auth[0].api === apiEndpoint) {
                session.auth[0] = authSession;
                return;
            }
        }
        session.auth.push(authSession);
        return;
    }
}
exports.AuthModel = AuthModel;
//# sourceMappingURL=auth.model.js.map