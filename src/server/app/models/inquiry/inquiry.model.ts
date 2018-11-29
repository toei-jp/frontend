import * as cinerino from '@cinerino/api-nodejs-client';

/**
 * 照会セッション
 * @interface IInquiryModel
 */
export interface IInquiryModel {
    order?: cinerino.factory.order.IOrder;
    input?: IInput;
    movieTheater?: cinerino.factory.organization.movieTheater.IOrganization;
}

interface IInput {
    reserveNum: string;
    telephone: string;
}

/**
 * 照会モデル
 * @class InquiryModel
 */
export class InquiryModel {
    /**
     * オーダー
     */
    public order?: cinerino.factory.order.IOrder;
    /**
     * 入力
     */
    public input: IInput;
    /**
     * 劇場
     */
    public movieTheater?: cinerino.factory.organization.movieTheater.IOrganization;

    /**
     * @constructor
     * @param {any} session
     */
    constructor(session?: any) {
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
        this.movieTheater = session.movieTheater;
    }


    /**
     * セッションへ保存
     * @memberof InquiryModel
     * @method save
     * @returns {Object}
     */
    public save(session: any): void {
        const inquirySession: IInquiryModel = {
            order: this.order,
            input: this.input,
            movieTheater: this.movieTheater
        };
        session.inquiry = inquirySession;
    }
}

