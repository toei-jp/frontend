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
 * 購入
 */
// import * as mvtkReserve from '@motionpicture/mvtk-reserve-service';
const chevre = require("@toei-jp/chevre-api-nodejs-client");
// import * as cinerino from '@toei-jp/cinerino-api-nodejs-client';
const debug = require("debug");
// import * as moment from 'moment';
// import { AuthModel } from '../../models/auth/auth.model';
const base_controller_1 = require("../base/base.controller");
const log = debug('frontend:purchase');
/**
 * 座席ステータス取得
 * @function getSeatState
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
function getSeatState(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        log('getSeatState');
        try {
            const args = req.query;
            const options = base_controller_1.getOptions(req);
            const result = yield new chevre.service.Event(options).searchScreeningEventOffers(args);
            res.json(result);
        }
        catch (err) {
            base_controller_1.errorProsess(res, err);
        }
    });
}
exports.getSeatState = getSeatState;
/**
 * 劇場コードで劇場取得
 * @function findMovieTheaterByBranchCode
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
function findMovieTheaterByBranchCode(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        log('getSeatState');
        try {
            const args = req.query;
            const options = base_controller_1.getOptions(req);
            const result = yield new chevre.service.Place(options).findMovieTheaterByBranchCode(args);
            res.json(result);
        }
        catch (err) {
            base_controller_1.errorProsess(res, err);
        }
    });
}
exports.findMovieTheaterByBranchCode = findMovieTheaterByBranchCode;
/**
 * ムビチケチケットコード取得
 * @function mvtkTicketcode
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
/*export async function mvtkTicketcode(req: Request, res: Response): Promise<void> {
    log('mvtkTicketcode');
    try {
        const args = req.body;
        const result = await chevre.service.master.mvtkTicketcode(args);
        res.json(result);
    } catch (err) {
        errorProsess(res, err);
    }
}*/
// TODO: fix
/**
 * ムビチケ照会
 * @function mvtkPurchaseNumberAuth
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
/*export async function mvtkPurchaseNumberAuth(req: Request, res: Response): Promise<void> {
    log('mvtkPurchaseNumberAuth');
    try {
        const args = req.body;
        const result = await mvtkReserve.services.auth.purchaseNumberAuth.purchaseNumberAuth(args);
        res.json(result);
    } catch (err) {
        errorProsess(res, err);
    }
}*/
/**
 * ムビチケ座席指定情報連携
 * @function mvtksSatInfoSync
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
/*export async function mvtksSatInfoSync(req: Request, res: Response): Promise<void> {
    log('mvtksSatInfoSync');
    try {
        const args = req.body;
        const result = await mvtkReserve.services.seat.seatInfoSync.seatInfoSync(args);
        res.json(result);
    } catch (err) {
        errorProsess(res, err);
    }
}*/
/**
 * スケジュールリスト取得
 * @memberof Purchase.PerformancesModule
 * @function getSchedule
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
/*export async function getSchedule(req: Request, res: Response): Promise<void> {
    try {
        const options = getOptions(req);
        const args = {
            startFrom: req.query.startFrom,
            startThrough: req.query.startThrough
        };

        const eventService = new cinerino.service.Event(options);
        const organizationService = new cinerino.service.Organization(options);
        const movietheaters = await organizationService.searchMovieTheaters({});
        const theaters = movietheaters.data.filter((movietheater) => {
            // 非表示劇場
            let filterResult = true;
            const hideTheaters = (process.env.HIDE_THEATERS === undefined)
                ? []
                : process.env.HIDE_THEATERS.replace(/\s/g, '').split(',');
            for (const theaterCode of hideTheaters) {
                if (theaterCode === movietheater.location.branchCode) {
                    filterResult = false;
                    break;
                }
            }

            return filterResult;
        });
        const screeningEvents = await eventService.searchScreeningEvents(args);
        const checkedScreeningEvents = await checkedSchedules({
            theaters: theaters,
            screeningEvents: screeningEvents.data
        });
        const result = {
            theaters: theaters,
            screeningEvents: checkedScreeningEvents
        };
        res.json({ result: result });
    } catch (err) {
        errorProsess(res, err);
    }
}*/
// type IEventWithOffer = chevre.factory.event.screeningEvent.IEvent;
/*interface IChevreSchedule {
    theater: cinerino.factory.organization.movieTheater.IAttributes;
    schedules: chevre.service.master.IScheduleResult[];
}*/
// let chevreSchedules: IChevreSchedule[] = [];
// chevreSchedulesUpdate();
/**
 * Chevreスケジュール更新
 * @function chevreSchedulesUpdate
 */
/*async function chevreSchedulesUpdate(): Promise<void> {
    log('chevreSchedulesUpdate start', chevreSchedules.length);
    try {
        const result: IChevreSchedule[] = [];
        const authModel = new AuthModel();
        const options = {
            endpoint: (<string>process.env.CINERINO_API_ENDPOINT),
            auth: authModel.create()
        };
        const organizationService = new cinerino.service.Organization(options);
        const theaters = await organizationService.searchMovieTheaters({});
        const end = 5;
        for (const theater of theaters.data) {
            if (theater.location.branchCode === undefined) {
                continue;
            }
            const scheduleArgs = {
                theaterCode: theater.location.branchCode,
                begin: moment().format('YYYYMMDD'),
                end: moment().add(end, 'week').format('YYYYMMDD')
            };
            const schedules = await chevre.service.master.schedule(scheduleArgs);
            result.push({
                theater: theater,
                schedules: schedules
            });
        }
        chevreSchedules = result;
        const upDateTime = 3600000; // 1000 * 60 * 60
        setTimeout(async () => { await chevreSchedulesUpdate(); }, upDateTime);
    } catch (err) {
        log(err);
        await chevreSchedulesUpdate();
    }
    log('chevreSchedulesUpdate end', chevreSchedules.length);
}*/
/**
 * Chevreスケジュール更新待ち
 * @function waitChevreSchedulesUpdate
 */
/*async function waitChevreSchedulesUpdate() {
    const timer = 1000;
    const limit = 10000;
    let count = 0;

    return new Promise<void>((resolve, reject) => {
        const check = setInterval(
            () => {
                if (count > limit) {
                    clearInterval(check);
                    reject();
                }
                if (chevreSchedules.length > 0) {
                    clearInterval(check);
                    resolve();
                }
                count += 1;
            },
            timer
        );
    });
}*/
/**
 * スケジュール整合性確認
 * @function checkedSchedules
 */
/*async function checkedSchedules(args: {
    theaters: cinerino.factory.organization.movieTheater.IAttributes[];
    screeningEvents: IEventWithOffer[];
}): Promise<IEventWithOffer[]> {
    if (chevreSchedules.length === 0) {
        await waitChevreSchedulesUpdate();
    }
    const screeningEvents: IEventWithOffer[] = [];
    for (const chevreSchedule of chevreSchedules) {
        for (const schedule of chevreSchedule.schedules) {
            const id = [
                chevreSchedule.theater.location.branchCode,
                schedule.titleCode,
                schedule.titleBranchNum,
                schedule.dateJouei,
                schedule.screenCode,
                schedule.timeBegin
            ].join('');
            const screeningEvent = args.screeningEvents.find((event) => {
                return (event.identifier === id);
            });
            if (screeningEvent !== undefined) {
                screeningEvents.push(screeningEvent);
            }
        }
    }
    // const diffList = diffScreeningEvents(args.screeningEvents, screeningEvents);
    // for (const diff of diffList) {
    //     log('diff', diff.identifier);
    // }
    // log('all length', screeningEvents.length + diffList.length);
    // log('screeningEvents length', screeningEvents.length);
    // log('diffList length', diffList.length);

    return screeningEvents;
}*/
/**
 * 差分抽出
 * @function diffScreeningEvents
 * @param　{IEventWithOffer[]} array1
 * @param {IEventWithOffer[]} array2
 */
/*export function diffScreeningEvents(array1: IEventWithOffer[], array2: IEventWithOffer[]) {
    const diffArray: IEventWithOffer[] = [];

    for (const array of array1) {
        const target = array2.find((event) => {
            return (event.identifier === array.identifier);
        });
        if (target === undefined) {
            diffArray.push(array);
        }
    }

    return diffArray;
}*/
