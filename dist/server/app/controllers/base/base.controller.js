"use strict";
/**
 * base
 */
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug");
const httpStatus = require("http-status");
const auth_model_1 = require("../../models/auth/auth.model");
const log = debug('toei-frontend:base');
/**
 * オプション取得
 * @function getOptions
 * @param {Request} req
 */
function getOptions(req, apiEndpoint) {
    let endpoint;
    endpoint = process.env.CINERINO_API_ENDPOINT;
    let authModel;
    if (req.session.auth !== undefined) {
        const authSession = req.session.auth.find((auth) => auth.api === apiEndpoint);
        authModel = new auth_model_1.AuthModel(authSession, apiEndpoint);
    }
    else {
        authModel = new auth_model_1.AuthModel({}, apiEndpoint);
    }
    const options = {
        endpoint,
        auth: authModel.create(),
        project: {
            id: process.env.PROJECT_ID
        }
    };
    authModel.save(req.session, apiEndpoint);
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
