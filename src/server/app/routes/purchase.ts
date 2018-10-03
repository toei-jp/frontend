/**
 * ルーティングAPI
 */

import * as express from 'express';
import * as purchase from '../controllers/purchase/purchase.controller';
const router = express.Router();

router.get('/findMovieTheaterByBranchCode', purchase.findMovieTheaterByBranchCode);
router.get('/getSeatState', purchase.getSeatState);
router.post('/mvtkTicketcode', purchase.mvtkTicket);
router.post('/mvtkPurchaseNumberAuth', purchase.mvtkPurchaseNumberAuth);
router.post('/mvtksSeatInfoSync', purchase.mvtksSeatInfoSync);
// router.post('/getSchedule', purchase.getSchedule);

export default router;
