/**
 * マスターデータ
 */
// import * as chevre from '@toei-jp/chevre-api-nodejs-client';
// import * as debug from 'debug';
// import { Request, Response } from 'express';
// import { errorProsess } from '../base/base.controller';
// const log = debug('frontend:master');
/**
 * 券種一覧取得
 * @function getSalesTickets
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
/*export async function getSalesTickets(req: Request, res: Response): Promise<void> {
    try {
        log('getSalesTickets');
        const args = req.query;
        const result = await chevre.service.Reservation.salesTicket(args);
        res.json(result);
    } catch (err) {
        errorProsess(res, err);
    }
}*/
/**
 * 券種マスター一覧取得
 * @function getTickets
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
/*export async function getTickets(req: Request, res: Response): Promise<void> {
    try {
        log('getTickets');
        const args = req.query;
        const result = await chevre.service.master.ticket(args);
        res.json(result);
    } catch (err) {
        errorProsess(res, err);
    }
}*/
//# sourceMappingURL=master.controller.js.map