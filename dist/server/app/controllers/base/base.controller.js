"use strict";
/**
 * base
 */
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug");
const httpStatus = require("http-status");
const auth_model_1 = require("../../models/auth/auth.model");
const log = debug('frontend:base');
/**
 * オプション取得
 * @function getOptions
 * @param {Request} req
 */
function getOptions(req, apiEndpoint) {
    let endpoint;
    if (apiEndpoint === auth_model_1.ApiEndpoint.chevre) {
        endpoint = process.env.CHEVRE_API_ENDPOINT;
    }
    else {
        endpoint = process.env.CINERINO_API_ENDPOINT;
    }
    const authModel = new auth_model_1.AuthModel(req.session.auth, apiEndpoint);
    const options = {
        endpoint,
        auth: authModel.create()
    };
    authModel.save(req.session);
    return options;
}
exports.getOptions = getOptions;
/**
 * エラー
 * @function error
 * @param {Response} res
 * @param {any} err
 */
function errorProsess(res, err) {
    log('errorProsess', err);
    if (err.code !== undefined) {
        res.status(err.code);
    }
    else {
        res.status(httpStatus.BAD_REQUEST);
    }
    res.json(err);
}
exports.errorProsess = errorProsess;
//# sourceMappingURL=base.controller.js.map