"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 照会
 */
const cinerino = require("@cinerino/api-nodejs-client");
const debug = require("debug");
const http_status_1 = require("http-status");
const libphonenumber_js_1 = require("libphonenumber-js");
const moment = require("moment-timezone");
const inquiry_model_1 = require("../../models/inquiry/inquiry.model");
const base_controller_1 = require("../base/base.controller");
const log = debug('toei-frontend:inquiry');
/**
 * 照会表示
 * @function render
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        log('render');
        try {
            const inquiryModel = new inquiry_model_1.InquiryModel(req.session.inquiry);
            const options = base_controller_1.getOptions(req);
            const branchCode = req.query.theater;
            log('searchMovieTheaters', { branchCodes: [branchCode] });
            inquiryModel.theater = (yield new cinerino.service.Place(options)
                .searchMovieTheaters({ branchCodes: [branchCode] })).data[0];
            inquiryModel.input.reserveNum = (req.query.reserve !== undefined) ? req.query.reserve : '';
            inquiryModel.save(req.session);
            res.locals.inquiryModel = inquiryModel;
            res.locals.error = null;
            res.render('inquiry/login');
            log('inquiryModel', inquiryModel);
        }
        catch (err) {
            log(err);
            res.locals.error = err;
            res.render('error/index');
        }
    });
}
exports.login = login;
/**
 * 照会
 * @function auth
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
function auth(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        log('auth');
        const options = base_controller_1.getOptions(req);
        const inquiryModel = new inquiry_model_1.InquiryModel(req.session.inquiry);
        try {
            loginForm(req);
            if (inquiryModel.theater === undefined) {
                throw new Error('theater is undefined');
            }
            const validationResult = yield req.getValidationResult();
            inquiryModel.input = {
                reserveNum: req.body.reserveNum,
                telephone: req.body.telephone
            };
            inquiryModel.save(req.session);
            if (validationResult.isEmpty()) {
                const theaterCode = inquiryModel.theater.branchCode;
                const phoneNumber = libphonenumber_js_1.parseNumber(req.body.telephone, 'JP');
                const telephone = libphonenumber_js_1.formatNumber(phoneNumber, 'E.164');
                const args = {
                    customer: { telephone },
                    confirmationNumber: Number(inquiryModel.input.reserveNum),
                };
                log('findByOrderInquiryKey', args);
                const orderService = new cinerino.service.Order(options);
                const order = yield orderService.findByConfirmationNumber(args);
                inquiryModel.order = yield orderService.authorizeOwnershipInfos({
                    customer: args.customer,
                    orderNumber: order.orderNumber
                });
                log('findByOrderInquiryKey', inquiryModel.order);
                if (inquiryModel.order === undefined) {
                    log('NOT FOUND');
                    const error = {
                        code: 404,
                        errors: [{
                                name: 'CinerinoError',
                                reason: 'NotFound',
                                entityName: 'order',
                                message: 'Not Found: order.'
                            }]
                    };
                    throw error;
                }
                inquiryModel.save(req.session);
                const orderNumber = inquiryModel.order.orderNumber;
                return res.redirect(`/inquiry/confirm/${orderNumber}/?theater=${theaterCode}`);
            }
            else {
                res.locals.inquiryModel = inquiryModel;
                res.locals.error = validationResult.mapped();
                res.render('inquiry/login');
                return;
            }
        }
        catch (err) {
            log(err);
            if (err.code !== undefined && err.code === http_status_1.NOT_FOUND) {
                res.locals.inquiryModel = inquiryModel;
                res.locals.error = getInquiryError(req);
                return res.render('inquiry/login');
            }
            res.locals.error = (err.message === undefined) ? err : { message: err.message };
            res.render('error/index');
        }
    });
}
exports.auth = auth;
/**
 * 照会確認表示
 * @function confirm
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
function confirm(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        log('confirm');
        if (req.session === undefined || req.session.inquiry === undefined) {
            const orderNumber = req.params.orderNumber;
            const theaterCode = req.query.theater;
            return res.redirect(`/inquiry/login?orderNumber=${orderNumber}&theater=${theaterCode}`);
        }
        const inquiryModel = new inquiry_model_1.InquiryModel(req.session.inquiry);
        res.locals.inquiryModel = inquiryModel;
        res.locals.moment = moment;
        res.locals.timeFormat = timeFormat;
        delete req.session.inquiry;
        res.render('inquiry/confirm');
    });
}
exports.confirm = confirm;
/**
 * 購入者情報入力フォーム
 */
function loginForm(req) {
    const minLength = 9;
    req.checkBody('reserveNum', `予約番号が未入力です`).notEmpty();
    req.checkBody('reserveNum', `予約番号は数字で入力してください`).matches(/^[0-9]+$/);
    req.checkBody('telephone', `電話番号が未入力です`).notEmpty();
    req.checkBody('telephone', `電話番号は数字で入力してください`).matches(/^[0-9]+$/);
    req.checkBody('telephone', `電話番号は${String(minLength)}文字以上で入力してください`).isLength({
        min: minLength
    });
}
/**
 * 照会エラー取得
 * @function getInquiryError
 * @param {Request} req
 * @returns {any}
 */
function getInquiryError(_req) {
    return {
        reserveNum: {
            parm: 'reserveNum',
            msg: `予約番号をご確認ください`,
            value: ''
        },
        telephone: {
            parm: 'telephone',
            msg: `電話番号をご確認ください`,
            value: ''
        }
    };
}
/**
 * 時間フォーマット
 * @function timeFormat
 * @param {Date} time 時間
 * @returns {string}
 */
function timeFormat(time) {
    moment.tz.setDefault('Asia/Tokyo');
    const mm = moment(time).tz('Asia/Tokyo');
    const hour = mm.format('HH');
    const minutes = mm.format('mm');
    return `${hour}:${minutes}`;
}
