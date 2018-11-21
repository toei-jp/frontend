/**
 * ルーティング
 */
import { Application, NextFunction, Request, Response } from 'express';
import * as path from 'path';
import { signInRedirect } from '../controllers/authorize/authorize.controller';
// import { getSchedule } from '../controllers/purchase/purchase.controller';
import authorizeRouter from './authorize';
import inquiryRouter from './inquiry';
// import masterRouter from './master';
import methodRouter from './method';

function defaultSetting(req: Request, res: Response, next: NextFunction) {
    res.locals.NODE_ENV = process.env.NODE_ENV;
    res.locals.PORTAL_SITE_URL = process.env.PORTAL_SITE_URL;
    res.locals.isApp = ((<Express.Session>req.session).awsCognitoIdentityId !== undefined);
    next();
}

function purchaseTransaction(req: Request, res: Response, _next: NextFunction) {
    let params = `performanceId=${req.query.performanceId}`;
    params += `&passportToken=${req.query.passportToken}`;
    if (req.query.identityId !== undefined) {
        params += `&identityId=${req.query.identityId}`;
    }
    if (req.query.native !== undefined) {
        params += `&native=${req.query.native}`;
    }
    if (req.query.member !== undefined) {
        params += `&member=${req.query.member}`;
    }
    if (req.query.accessToken !== undefined) {
        params += `&accessToken=${req.query.accessToken}`;
    }
    res.redirect(`/?${params}`);
}

function root(_req: Request, res: Response, _next: NextFunction) {
    const fileName = (process.env.NODE_ENV === 'production') ? 'production.html' : 'index.html';
    res.sendFile(path.resolve(`${__dirname}/../../../client/${process.env.NODE_ENV}/${fileName}`));
}

function notfound(_req: Request, res: Response, _next: NextFunction) {
    res.render('notfound/index');
}

function error(err: Error, _req: Request, res: Response, _next: NextFunction) {
    res.locals.error = err;
    res.render('error/index');
}

export default (app: Application) => {
    app.set('layout', 'layouts/layout');
    app.use(defaultSetting);
    // app.use('/api/master', masterRouter);
    app.use('/api/authorize', authorizeRouter);
    app.use('/inquiry', inquiryRouter);
    app.use('/method', methodRouter);
    // app.get('/purchase/performances/getSchedule', getSchedule);
    app.get('/purchase/transaction', purchaseTransaction);
    app.get('/signIn', signInRedirect);
    app.get('/', root);
    app.use(notfound);
    app.use(error);
};
