/**
 * 照会
 */
import * as cinerino from '@cinerino/api-nodejs-client';
import * as debug from 'debug';
import { Request, Response } from 'express';
import { NOT_FOUND } from 'http-status';
import { formatNumber, parseNumber } from 'libphonenumber-js';
import * as moment from 'moment-timezone';
import { InquiryModel } from '../../models/inquiry/inquiry.model';
import { getOptions } from '../base/base.controller';
const log = debug('toei-frontend:inquiry');

/**
 * 照会表示
 * @function render
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function login(req: Request, res: Response): Promise<void> {
    log('render');
    try {
        const inquiryModel = new InquiryModel((<Express.Session>req.session).inquiry);
        const options = getOptions(req);
        const args = { location: { branchCodes: [req.query.theater] } };
        log('searchMovieTheaters', args);
        inquiryModel.seller = (await new cinerino.service.Seller(options).search(args)).data[0];
        inquiryModel.input.reserveNum = (req.query.reserve !== undefined) ? req.query.reserve : '';
        inquiryModel.save(req.session);
        res.locals.inquiryModel = inquiryModel;
        res.locals.error = null;
        res.render('inquiry/login');
        log('inquiryModel', inquiryModel);
    } catch (err) {
        log(err);
        res.locals.error = err;
        res.render('error/index');
    }
}

/**
 * 照会
 * @function auth
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function auth(req: Request, res: Response): Promise<void> {
    log('auth');
    const options = getOptions(req);
    const inquiryModel = new InquiryModel((<Express.Session>req.session).inquiry);
    try {
        loginForm(req);
        if (inquiryModel.seller === undefined) {
            throw new Error('seller is undefined');
        }
        const validationResult = await req.getValidationResult();
        inquiryModel.input = {
            reserveNum: req.body.reserveNum,
            telephone: req.body.telephone
        };
        inquiryModel.save(req.session);
        if (validationResult.isEmpty()) {
            const theaterCode = (<any>inquiryModel.seller.location).branchCode;
            const phoneNumber = parseNumber(req.body.telephone, 'JP');
            const telephone = formatNumber(phoneNumber, 'E.164');
            const args = {
                customer: { telephone },
                confirmationNumber: Number(inquiryModel.input.reserveNum),
                // theaterCode: inquiryModel.seller.branchCode
            };
            log('findByOrderInquiryKey', args);
            const orderService = new cinerino.service.Order(options);
            const order = await orderService.findByConfirmationNumber(args);
            inquiryModel.order = await orderService.authorizeOwnershipInfos({
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
        } else {
            res.locals.inquiryModel = inquiryModel;
            res.locals.error = validationResult.mapped();
            res.render('inquiry/login');

            return;
        }
    } catch (err) {
        log(err);
        if (err.code !== undefined && err.code === NOT_FOUND) {
            res.locals.inquiryModel = inquiryModel;
            res.locals.error = getInquiryError(req);
            return res.render('inquiry/login');
        }
        res.locals.error = (err.message === undefined) ? err : { message: err.message };
        res.render('error/index');
    }
}

/**
 * 照会確認表示
 * @function confirm
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function confirm(req: Request, res: Response): Promise<void> {
    log('confirm');
    if (req.session === undefined || req.session.inquiry === undefined) {
        const orderNumber = req.params.orderNumber;
        const theaterCode = req.query.theater;
        return res.redirect(`/inquiry/login?orderNumber=${orderNumber}&theater=${theaterCode}`);
    }
    const inquiryModel = new InquiryModel(req.session.inquiry);
    res.locals.inquiryModel = inquiryModel;
    res.locals.moment = moment;
    res.locals.timeFormat = timeFormat;
    delete req.session.inquiry;
    res.render('inquiry/confirm');
}

/**
 * 購入者情報入力フォーム
 */
function loginForm(req: Request): void {
    const minLength = 9;
    req.checkBody('reserveNum', `予約番号が未入力です`).notEmpty();
    req.checkBody('reserveNum', `予約番号は数字で入力してください`).matches(/^[0-9]+$/);
    req.checkBody('telephone', `電話番号が未入力です`).notEmpty();
    req.checkBody('telephone', `電話番号は数字で入力してください`).matches(/^[0-9]+$/);
    req.checkBody(
        'telephone',
        `電話番号は${String(minLength)}文字以上で入力してください`
    ).isLength({
        min: minLength
    });
}

/**
 * 照会エラー取得
 * @function getInquiryError
 * @param {Request} req
 * @returns {any}
 */
function getInquiryError(_req: Request) {
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
function timeFormat(time: Date | string) {
    moment.tz.setDefault('Asia/Tokyo');
    const mm = moment(time).tz('Asia/Tokyo');
    const hour = mm.format('HH');
    const minutes = mm.format('mm');

    return `${hour}:${minutes}`;
}
