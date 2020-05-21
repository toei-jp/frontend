"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = require("http-status");
const moment = require("moment");
const path = require("path");
const authorize_controller_1 = require("../controllers/authorize/authorize.controller");
const authorize_1 = require("./authorize");
const inquiry_1 = require("./inquiry");
function defaultSetting(req, res, next) {
    res.locals.NODE_ENV = process.env.NODE_ENV;
    res.locals.PORTAL_SITE_URL = process.env.PORTAL_SITE_URL;
    res.locals.isApp = (req.session.awsCognitoIdentityId !== undefined);
    next();
}
/**
 * ルート
 */
function root(req, res, _next) {
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
function external(req, res, _next) {
    if (req.session === undefined) {
        res.sendStatus(http_status_1.BAD_REQUEST);
        res.json({ error: 'session undefined' });
        return;
    }
    res.json((req.session.external === undefined) ? {} : req.session.external);
}
/**
 * NOT FOUND
 */
function notfound(_req, res, _next) {
    res.render('notfound/index');
}
/**
 * ERROR
 */
function error(err, _req, res, _next) {
    res.locals.error = err;
    res.render('error/index');
}
/**
 * サーバー時間取得
 */
function getServerDate(_req, res, _next) {
    res.json({
        date: moment().toISOString()
    });
}
exports.default = (app) => {
    app.set('layout', 'layouts/layout');
    app.use(defaultSetting);
    app.use('/api/authorize', authorize_1.default);
    app.get('/api/getServerDate', getServerDate);
    app.post('/api/external', external);
    app.use('/inquiry', inquiry_1.default);
    app.get('/signIn', authorize_controller_1.signInRedirect);
    app.get('/projects/:projectId/inquiry', (req, res) => {
        const theaterBrunchCode = req.query.theaterBrunchCode;
        const projectId = req.params.projectId;
        res.redirect(`/inquiry/login?theater=${theaterBrunchCode}&projectId=${projectId}`);
    });
    app.get('/projects/:projectId/purchase/transaction/:eventId', (req, res) => {
        const projectId = req.params.projectId;
        const eventId = req.params.eventId;
        res.redirect(`/?performanceId=${eventId}&projectId=${projectId}`);
    });
    app.get('/', root);
    app.use(notfound);
    app.use(error);
};
