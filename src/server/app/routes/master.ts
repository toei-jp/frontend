/**
 * ルーティングAPI
 */

import * as express from 'express';
import * as master from '../controllers/master/master.controller';
const router = express.Router();

router.get('/getSalesTickets', master.getSalesTickets);
router.get('/getTickets', master.getTickets);

export default router;
