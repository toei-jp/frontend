"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 照会モデル
 * @class InquiryModel
 */
class InquiryModel {
    /**
     * @constructor
     * @param {any} session
     */
    constructor(session) {
        if (session === undefined) {
            session = {};
        }
        this.order = session.order;
        this.input = (session.input !== undefined)
            ? session.input
            : {
                reserveNum: '',
                telephone: ''
            };
        this.theater = session.theater;
        this.seller = session.seller;
    }
    /**
     * セッションへ保存
     * @memberof InquiryModel
     * @method save
     * @returns {Object}
     */
    save(session) {
        const inquirySession = {
            order: this.order,
            input: this.input,
            theater: this.theater,
            seller: this.seller
        };
        session.inquiry = inquirySession;
    }
}
exports.InquiryModel = InquiryModel;
