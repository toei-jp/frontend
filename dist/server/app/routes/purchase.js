"use strict";
/**
 * ルーティングAPI
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const purchase = require("../controllers/purchase/purchase.controller");
const router = express.Router();
router.get('/findMovieTheaterByBranchCode', purchase.findMovieTheaterByBranchCode);
router.get('/getSeatState', purchase.getSeatState);
router.post('/mvtkTicketcode', purchase.mvtkTicket);
router.post('/mvtkPurchaseNumberAuth', purchase.mvtkPurchaseNumberAuth);
router.post('/mvtksSeatInfoSync', purchase.mvtksSeatInfoSync);
// router.post('/getSchedule', purchase.getSchedule);
exports.default = router;
//# sourceMappingURL=purchase.js.map