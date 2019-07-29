/**
 * authorize
 */
import * as debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import { AuthModel } from '../../models/auth/auth.model';
import { Auth2Model } from '../../models/auth2/auth2.model';
import { errorProsess } from '../base/base.controller';
const log = debug('toei-frontend:authorize');

export async function getCredentials(_: Request, res: Response) {
    log('getCredentials');
    try {
        const endpoint = (<string>process.env.CINERINO_API_ENDPOINT);
        const authModel = new AuthModel();
        const options = {
            endpoint,
            auth: authModel.create()
        };
        const accessToken = await options.auth.getAccessToken();
        const waiterServerUrl = <string>process.env.WAITER_SERVER_URL;
        res.json({
            accessToken,
            userName: undefined,
            clientId: options.auth.options.clientId,
            endpoint,
            waiterServerUrl
        });
    } catch (err) {
        errorProsess(res, err);
    }
}


/**
 * サインイン処理
 * @param {Request} req
 * @param {Response} res
 */
export async function signIn(req: Request, res: Response) {
    log('signIn');
    if (req.session === undefined) {
        throw new Error('session is undefined');
    }
    delete req.session.auth;
    const authModel = new Auth2Model(req.session.auth);
    const auth = authModel.create();
    const authUrl = auth.generateAuthUrl({
        scopes: authModel.scopes,
        state: authModel.state,
        codeVerifier: authModel.codeVerifier
    });
    delete req.session.auth;
    res.json({
        url: authUrl
    });
}

/**
 * サインインリダイレクト処理
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export async function signInRedirect(req: Request, res: Response, next: NextFunction) {
    log('signInRedirect');
    try {
        if (req.session === undefined) {
            throw new Error('session is undefined');
        }
        const authModel = new Auth2Model(req.session.auth);
        if (req.query.state !== authModel.state) {
            throw (new Error(`state not matched ${req.query.state} !== ${authModel.state}`));
        }
        const auth = authModel.create();
        const credentials = await auth.getToken(
            req.query.code,
            <string>authModel.codeVerifier
        );
        // log('credentials published', credentials);

        authModel.credentials = credentials;
        authModel.save(req.session);

        auth.setCredentials(credentials);
        res.redirect('/#/auth/signin');
    } catch (err) {
        next(err);
    }
}
