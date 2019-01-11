"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    app.use('/api/authorize', authorize_1.default);
    app.use('/inquiry', inquiry_1.default);
    app.get('/signIn', authorize_controller_1.signInRedirect);
    app.get('/', root);
    app.use(notfound);
    app.use(error);
};
