"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const authorize_controller_1 = require("../controllers/authorize/authorize.controller");
// import { getSchedule } from '../controllers/purchase/purchase.controller';
const authorize_1 = require("./authorize");
const inquiry_1 = require("./inquiry");
// import masterRouter from './master';
const method_1 = require("./method");
const purchase_1 = require("./purchase");
function defaultSetting(req, res, next) {
    res.locals.NODE_ENV = process.env.NODE_ENV;
    res.locals.PORTAL_SITE_URL = process.env.PORTAL_SITE_URL;
    res.locals.APP_SITE_URL = process.env.APP_SITE_URL;
    res.locals.isApp = (req.session.awsCognitoIdentityId !== undefined);
    next();
}
function purchaseTransaction(req, res, _next) {
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
function root(_req, res, _next) {
    const fileName = (process.env.NODE_ENV === 'production') ? 'production.html' : 'index.html';
    res.sendFile(path.resolve(`${__dirname}/../../../client/${process.env.NODE_ENV}/${fileName}`));
}
function notfound(_req, res, _next) {
    res.render('notfound/index');
}
function error(err, _req, res, _next) {
    res.locals.error = err;
    res.render('error/index');
}
exports.default = (app) => {
    app.set('layout', 'layouts/layout');
    app.use(defaultSetting);
    app.use('/api/purchase', purchase_1.default);
    // app.use('/api/master', masterRouter);
    app.use('/api/authorize', authorize_1.default);
    app.use('/inquiry', inquiry_1.default);
    app.use('/method', method_1.default);
    // app.get('/purchase/performances/getSchedule', getSchedule);
    app.get('/purchase/transaction', purchaseTransaction);
    app.get('/signIn', authorize_controller_1.signInRedirect);
    app.get('/', root);
    app.use(notfound);
    app.use(error);
};
