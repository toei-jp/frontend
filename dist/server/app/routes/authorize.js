"use strict";
/**
 * ルーティングAPI
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const authorize = require("../controllers/authorize/authorize.controller");
const router = express.Router();
router.get('/getCredentials', authorize.getCredentials);
// router.get('/signIn', authorize.signIn);
exports.default = router;
//# sourceMappingURL=authorize.js.map