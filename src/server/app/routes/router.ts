/**
 * ルーティング
 */
import { Application, NextFunction, Request, Response } from 'express';
import { BAD_REQUEST } from 'http-status';
import moment = require('moment');
import * as path from 'path';
import { signInRedirect } from '../controllers/authorize/authorize.controller';
import authorizeRouter from './authorize';
import inquiryRouter from './inquiry';

function defaultSetting(req: Request, res: Response, next: NextFunction) {
    res.locals.NODE_ENV = process.env.NODE_ENV;
    res.locals.PORTAL_SITE_URL = process.env.PORTAL_SITE_URL;
    res.locals.isApp = ((<Express.Session>req.session).awsCognitoIdentityId !== undefined);
    next();
}

/**
 * ルート
 */
function root(req: Request, res: Response, _next: NextFunction) {
    if (req.xhr) {
        res.status(httpStatus.NOT_FOUND).json('NOT FOUND');
        return;
    }
    if (req.session !== undefined) {
        req.session.external = req.query;
    }
    res.sendFile(path.resolve(`${__dirname}/../../../client/${process.env.NODE_ENV}/index.html`));
}

/**
 * 外部連携情報取得
 */
function external(req: Request, res: Response, _next: NextFunction) {
    if (req.session === undefined) {
        res.sendStatus(BAD_REQUEST);
        res.json({ error: 'session undefined' });
        return;
    }
    res.json((req.session.external === undefined) ? {} : req.session.external);
}

/**
 * NOT FOUND
 */
function notfound(_req: Request, res: Response, _next: NextFunction) {
    res.render('notfound/index');
}

/**
 * ERROR
 */
function error(err: Error, _req: Request, res: Response, _next: NextFunction) {
    res.locals.error = err;
    res.render('error/index');
}

/**
 * サーバー時間取得
 */
function getServerDate(_req: Request, res: Response, _next: NextFunction) {
    res.json({
        date: moment().toISOString()
    });
}

export default (app: Application) => {
    app.set('layout', 'layouts/layout');
    app.use(defaultSetting);
    app.use('/api/authorize', authorizeRouter);
    app.get('/api/getServerDate', getServerDate);
    app.post('/api/external', external);
    app.use('/inquiry', inquiryRouter);
    app.get('/signIn', signInRedirect);
    app.get('/', root);
    app.use(notfound);
    app.use(error);
};
