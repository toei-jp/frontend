/**
 * base
 */

import * as debug from 'debug';
import { Request, Response } from 'express';
import * as httpStatus from 'http-status';
import { ApiEndpoint, AuthModel } from '../../models/auth/auth.model';

const log = debug('frontend:base');

/**
 * オプション取得
 * @function getOptions
 * @param {Request} req
 */
export function getOptions(req: Request, apiEndpoint?: ApiEndpoint) {
    let endpoint: string;
    if (apiEndpoint === ApiEndpoint.chevre) {
        endpoint = (<string>process.env.CHEVRE_API_ENDPOINT);
    } else {
        endpoint = (<string>process.env.CINERINO_API_ENDPOINT);
    }
    const authModel = new AuthModel((<Express.Session>req.session).auth, apiEndpoint);
    const options = {
        endpoint,
        auth: authModel.create()
    };
    authModel.save(req.session);

    return options;
}

/**
 * エラー
 * @function error
 * @param {Response} res
 * @param {any} err
 */
export function errorProsess(res: Response, err: any) {
    log('errorProsess', err);
    if (err.code !== undefined) {
        res.status(err.code);
    } else {
        res.status(httpStatus.BAD_REQUEST);
    }
    res.json(err);
}
