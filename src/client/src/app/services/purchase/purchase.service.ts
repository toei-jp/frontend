import { Injectable } from '@angular/core';
import * as mvtkReserve from '@motionpicture/mvtk-reserve-service';
import * as factory from '@toei-jp/cinerino-factory';
import * as moment from 'moment';
import { Reservation } from '../../models';
import { TimeFormatPipe } from '../../pipes/time-format/time-format.pipe';
import { AwsCognitoService } from '../aws-cognito/aws-cognito.service';
import { CallNativeService } from '../call-native/call-native.service';
import { CinerinoService } from '../cinerino/cinerino.service';
import { SaveType, StorageService } from '../storage/storage.service';
import { UserService } from '../user/user.service';

declare const ga: Function;

export type ICustomerContact = factory.transaction.placeOrder.ICustomerContact;
export type ISalesTicketResult = factory.chevre.event.screeningEvent.ITicketOffer;
type IUnauthorizedCardOfMember = factory.paymentMethod.paymentCard.creditCard.IUnauthorizedCardOfMember;
type IUncheckedCardTokenized = factory.paymentMethod.paymentCard.creditCard.IUncheckedCardTokenized;

export interface IOffer {
    price: number;
    priceCurrency: string;
    seatNumber: string;
    seatSection: string;
    selected: boolean;
    validation: boolean;
    ticketInfo: {
        mvtkNum: string;
        ticketId: string,
        ticketName: { en: string, ja: string };
        description: { en: string, ja: string };
        charge: number,
        mvtkAppPrice: number;
        kbnEisyahousiki: string;
        mvtkKbnDenshiken: string;
        mvtkKbnMaeuriken: string;
        mvtkKbnKensyu: string;
        mvtkSalesPrice: number;
        seatNum: string;
        ticketCount: number,
    };
}

interface IData {
    /**
     * 取引
     */
    transaction?: factory.transaction.placeOrder.ITransaction;
    /**
     * 上映イベント
     */
    screeningEvent?: factory.chevre.event.screeningEvent.IEvent;
    /**
     * 劇場ショップ
     */
    movieTheaterOrganization?: factory.organization.movieTheater.IOrganization;
    /**
     * 販売可能チケット情報
     */
    salesTickets: ISalesTicketResult[];
    /**
     * 予約座席
     */
    seatReservationAuthorization?: factory.action.authorize.offer.seatReservation.IAction;
    /**
     * 予約座席パラメタ
     */
    reservationAuthorizationArgs?: factory.chevre.transaction.reserve.IObjectWithoutDetail & {
        /**
         * 取引ID
         */
        transactionId: string;
    };
    offers: IOffer[];
    /**
     * オーダー回数
     */
    orderCount: number;
    /**
     * GMOトークンオブジェクト
     */
    gmoTokenObject?: IGmoTokenObject;
    /**
     * 支払いクレジットカード
     */
    paymentCreditCard?: IUnauthorizedCardOfMember | IUncheckedCardTokenized;
    /**
     * クレジットカードエラー
     */
    isCreditCardError: boolean;
    /**
     * 決済情報（クレジット）
     */
    creditCardAuthorization?: {
        id: string;
    };
    /**
     * 購入者情報
     */
    customerContact?: ICustomerContact;
    /**
     * ムビチケ券種情報
     */
    mvtkTickets: factory.action.check.paymentMethod.movieTicket.IAction[];
    /**
     * 予約リスト
     */
    reservations: Reservation[];
}

export interface IGmoTokenObject {
    token: string;
    toBeExpiredAt: string;
    maskedCardNo: string;
    isSecurityCodeSet: boolean;
}

export interface IMvtkTicket {
    mvtkTicketcodeResult: { code: string; name: string };
    knyknrNoInfo: mvtkReserve.services.auth.purchaseNumberAuth.IPurchaseNumberInfo;
    ykknInfo: mvtkReserve.services.auth.purchaseNumberAuth.IValidTicket;
    input?: {
        knyknrNo: string;
        pinCd: string;
    };
}

/**
 * インセンティブ
 */
/*enum Incentive {
    WatchingMovies = 1
}*/

@Injectable()
export class PurchaseService {

    public data: IData;

    constructor(
        private storage: StorageService,
        private cinerino: CinerinoService,
        private awsCognito: AwsCognitoService,
        private callNative: CallNativeService,
        private user: UserService
    ) {
        this.load();
    }

    /**
     * 読み込み
     * @method load
     */
    public load() {
        const data: IData | null = this.storage.load('purchase', SaveType.Session);
        if (data === null) {
            this.data = {
                salesTickets: [],
                mvtkTickets: [],
                // pointTickets: [],
                orderCount: 0,
                // incentive: 0,
                isCreditCardError: false,
                offers: [],
                reservations: []
            };

            return;
        }
        this.data = data;
    }

    /**
     * 保存
     * @method save
     */
    public save() {
        this.storage.save('purchase', this.data, SaveType.Session);
    }

    /**
     * リセット
     * @method reset
     */
    public reset() {
        this.data = {
            salesTickets: [],
            mvtkTickets: [],
            // pointTickets: [],
            orderCount: 0,
            // incentive: 0,
            isCreditCardError: false,
            offers: [],
            reservations: []

        };
        this.save();
    }

    /**
     * 期限切れ
     * @method isExpired
     */
    public isExpired() {
        if (this.data.transaction === undefined) {
            throw new Error('status is different');
        }
        const expires = moment(this.data.transaction.expires).unix();
        const now = moment().unix();
        let result = false;
        if (expires < now) {
            result = true;
        }

        return result;
    }

    /**
     * 販売可能時間判定
     * @method isSalesTime
     * @param {factory.chevre.event.screeningEvent.IEvent} screeningEvent
     * @returns {boolean}
     */
    public isSalesTime(screeningEvent: factory.chevre.event.screeningEvent.IEvent): boolean {
        const END_TIME = 30; // 30分前

        return (moment().unix() < moment(screeningEvent.startDate).subtract(END_TIME, 'minutes').unix());
    }

    /**
     * 販売可能判定
     * @method isSales
     * @param {factory.chevre.event.screeningEvent.IEvent} screeningEvent
     * @returns {boolean}
     */
    public isSales(screeningEvent: factory.chevre.event.screeningEvent.IEvent): boolean {
        // const PRE_SALE = '1'; // 先行販売

        // return (moment(screeningEvent.info.rsvStartDate).unix() <= moment().unix()
        //     || screeningEvent.info.flgEarlyBooking === PRE_SALE);
        if (screeningEvent.saleStartDate === undefined) {
            // 一旦true
            return true;
        }
        return moment(screeningEvent.saleStartDate).unix() <= moment().unix();
    }

    /**
     * 劇場名取得
     * @method getTheaterName
     * @returns {string}
     */
    public getTheaterName(): string {
        if (this.data.screeningEvent === undefined) {
            return '';
        }
        const screeningEvent = this.data.screeningEvent;

        return screeningEvent.superEvent.location.name.ja;
    }

    /**
     * スクリーン名取得
     * @method getScreenName
     * @returns {string}
     */
    public getScreenName(): string {
        if (this.data.screeningEvent === undefined) {
            return '';
        }
        const screeningEvent = this.data.screeningEvent;

        return screeningEvent.location.name.ja;
    }

    /**
     * 作品名取得
     * @method getTitle
     * @returns {string}
     */
    public getTitle(): string {
        if (this.data.screeningEvent === undefined) {
            return '';
        }
        const screeningEvent = this.data.screeningEvent;

        return screeningEvent.name.ja;
    }

    /**
     * 鑑賞日取得
     * @method getAppreciationDate
     * @returns {string}
     */
    public getAppreciationDate(): string {
        if (this.data.screeningEvent === undefined) {
            return '';
        }
        const screeningEvent = this.data.screeningEvent;
        moment.locale('ja');

        return moment(screeningEvent.startDate).format('YYYY年MM月DD日(ddd)');
    }

    /**
     * 上映開始時間取得
     * @method getStartDate
     * @returns {string}
     */
    public getStartDate(): string {
        if (this.data.screeningEvent === undefined) {
            return '';
        }
        return new TimeFormatPipe().transform(this.data.screeningEvent.startDate);
    }

    /**
     * 上映終了取得
     * @method getEndDate
     * @returns {string}
     */
    public getEndDate(): string {
        if (this.data.screeningEvent === undefined) {
            return '';
        }
        return new TimeFormatPipe().transform(this.data.screeningEvent.endDate);
    }

    /**
     * 合計金額計算
     * @method getTotalPrice
     */
    public getTotalPrice(): number {
        let result = 0;
        if (this.data.seatReservationAuthorization === undefined) {
            return result;
        }
        for (const offer of this.data.offers) {
            result += offer.price;
        }

        return result;
    }

    /**
     * ムビチケ合計金額計算
     * @method getTotalPrice
     */
    public getMvtkTotalPrice(): number {
        let result = 0;
        if (this.data.seatReservationAuthorization === undefined) {
            return result;
        }
        for (const offer of this.data.offers) {
            result += offer.ticketInfo.mvtkSalesPrice;
        }

        return result;
    }

    /**
     * ムビチケ対応作品判定
     * @method isUsedMvtk
     * @returns {boolean}
     */
    public isUsedMvtk(): boolean {
        if (this.data.screeningEvent === undefined) {
            return false;
        }

        return this.data.screeningEvent.superEvent.mvtkFlg === 1 &&
            this.data.screeningEvent.mvtkExcludeFlg !== 1;
    }

    /**
     * ポイントでの予約判定
     * @method isReserveMvtk
     * @returns {boolean}
     */
    public isReserveMvtk(): boolean {
        let result = false;
        if (this.data.seatReservationAuthorization === undefined) {
            return result;
        }
        for (const offer of this.data.offers) {
            if (offer.ticketInfo.mvtkNum !== '') {
                result = true;
                break;
            }
        }
        return result;
    }

    /**
     * 取引開始処理
     * @method transactionStartProcess
     */
    public async transactionStartProcess(args: {
        passportToken: string;
        screeningEvent: factory.chevre.event.screeningEvent.IEvent
    }) {
        // 購入データ削除
        this.reset();
        this.data.screeningEvent = args.screeningEvent;
        await this.cinerino.getServices();
        // 劇場のショップを検索
        this.data.movieTheaterOrganization = (await this.cinerino.organization.findMovieTheaterByBranchCode({
            branchCode: this.data.screeningEvent.superEvent.location.branchCode
        })).data[0];
        // 取引期限
        const VALID_TIME = 15;
        const expires = moment().add(VALID_TIME, 'minutes').toDate();
        // 取引開始
        this.data.transaction = await this.cinerino.transaction.placeOrder.start({
            expires: expires,
            seller: {
                id: this.data.movieTheaterOrganization.id,
                typeOf: this.data.movieTheaterOrganization.typeOf
            },
            object: {
                passport: {
                    token: args.passportToken
                }
            }
        });
        this.save();
    }

    /**
     * 座席開放処理
     * @method cancelSeatRegistrationProcess
     */
    public async cancelSeatRegistrationProcess() {
        if (this.data.transaction === undefined
            || this.data.reservationAuthorizationArgs === undefined) {
            throw new Error('status is different');
        }
        await this.cinerino.getServices();
        const cancelSeatReservationArgs = {
            transactionId: this.data.transaction.id,
            // actionId: this.data.tmpSeatReservationAuthorization.id
        };
        await this.cinerino.transaction.placeOrder.cancel(cancelSeatReservationArgs);
        this.data.reservationAuthorizationArgs = undefined;
        this.reset();
    }

    /**
     * 座席登録処理
     * @method seatRegistrationProcess
     */
    public async seatRegistrationProcess(offers: IOffer[]) {
        if (this.data.transaction === undefined
            || this.data.screeningEvent === undefined) {
            throw new Error('status is different');
        }
        await this.cinerino.getServices();
        // 予約中なら座席削除
        if (this.data.reservationAuthorizationArgs !== undefined) {
            const cancelSeatReservationArgs = {
                transactionId: this.data.transaction.id,
                // actionId: this.data.tmpSeatReservationAuthorization.id
            };
            await this.cinerino.transaction.placeOrder.cancel(cancelSeatReservationArgs);
            this.data.reservationAuthorizationArgs = undefined;
            this.save();
        }

        this.data.reservationAuthorizationArgs = {
            transactionId: this.data.transaction.id,
            event: {
                id: this.data.screeningEvent.id
            },
            notes: '',
            clientUser: this.data.transaction.object.clientUser,
            acceptedOffer: offers.map((o) => ({
                ticketedSeat: {
                    seatSection: o.seatSection,
                    seatNumber: o.seatNumber,
                    seatRow: '',
                    seatingType: '',
                    typeOf: factory.chevre.placeType.Seat
                },
                id: ''
            }))
        };
        this.data.offers = offers;
        this.data.orderCount = 0;
        this.data.seatReservationAuthorization = undefined;
        this.save();
    }

    /**
     * 券種登録処理
     * @method ticketRegistrationProcess
     */
    public async ticketRegistrationProcess(tickets: { ticketId: string, seatNum: string }[]) {
        if (this.data.transaction === undefined
            || this.data.reservationAuthorizationArgs === undefined
            || this.data.screeningEvent === undefined) {
            throw new Error('status is different');
        }
        await this.cinerino.getServices();
        // const changeSeatReservationArgs = {
        //     transactionId: this.data.transaction.id,
        //     actionId: this.data.tmpSeatReservationAuthorization.id,
        //     eventIdentifier: this.data.screeningEvent.identifier,
        //     offers: offers
        // };
        // console.log('changeSeatReservationArgs', changeSeatReservationArgs);
        // this.data.seatReservationAuthorization =
        //     await this.cinerino.transaction.placeOrder.changeSeatReservationOffers(changeSeatReservationArgs);
        const rsvArgs = this.data.reservationAuthorizationArgs;
        rsvArgs.acceptedOffer = rsvArgs.acceptedOffer.map((offer) => {
            const match = tickets.find((ticket) => ticket.seatNum === offer.ticketedSeat.seatNumber);
            if (match !== undefined) {
                offer.id = match.ticketId;
                return offer;
            }
            throw new Error('seat ticket not found');
        });
        this.data.seatReservationAuthorization =
            await this.cinerino.transaction.placeOrder.authorizeSeatReservation(rsvArgs);
        if (this.data.seatReservationAuthorization === undefined) {
            throw new Error('status is different');
        }
        if (this.data.creditCardAuthorization !== undefined) {
            // クレジットカード登録済みなら削除
            const cancelCreditCardAuthorizationArgs = {
                transactionId: this.data.transaction.id,
                actionId: this.data.creditCardAuthorization.id
            };
            await this.cinerino.transaction.placeOrder.voidCreditCardPayment(cancelCreditCardAuthorizationArgs);
            this.data.creditCardAuthorization = undefined;
            this.save();
        }
        this.save();
    }

    /**
     * 購入者情報登録処理
     * @method customerContactRegistrationProcess
     */
    public async customerContactRegistrationProcess(args: factory.transaction.placeOrder.ICustomerContact) {
        if (this.data.transaction === undefined) {
            throw new Error('transaction is undefined');
        }
        await this.cinerino.getServices();
        // 入力情報を登録
        this.data.customerContact = await this.cinerino.transaction.placeOrder.setCustomerContact({
            transactionId: this.data.transaction.id,
            contact: args
        });
        if (this.user.isNative() /*&& !this.user.isMember()*/) {
            try {
                const updateRecordsArgs = {
                    datasetName: 'profile',
                    value: {
                        familyName: args.familyName,
                        givenName: args.givenName,
                        email: args.email,
                        telephone: args.telephone
                    }
                };
                await this.awsCognito.updateRecords(updateRecordsArgs);
            } catch (err) {
                console.error(err);
            }
        }

        this.save();
    }

    /**
     * クレジットカード支払い処理
     */
    public async creditCardPaymentProcess() {
        if (this.data.transaction === undefined
            || this.data.paymentCreditCard === undefined) {
            throw new Error('status is different');
        }
        await this.cinerino.getServices();
        if (this.data.creditCardAuthorization !== undefined) {
            // クレジットカード登録済みなら削除
            const cancelCreditCardAuthorizationArgs = {
                transactionId: this.data.transaction.id,
                actionId: this.data.creditCardAuthorization.id
            };
            await this.cinerino.transaction.placeOrder.voidCreditCardPayment(cancelCreditCardAuthorizationArgs);
            this.data.creditCardAuthorization = undefined;
            this.save();
        }
        // クレジットカード登録
        const METHOD_LUMP = '1';
        this.data.creditCardAuthorization =
            await this.cinerino.transaction.placeOrder.authorizeCreditCardPayment({
                transactionId: this.data.transaction.id,
                typeOf: factory.paymentMethodType.CreditCard,
                orderId: this.createOrderId(),
                amount: this.getTotalPrice(),
                method: <any>METHOD_LUMP,
                creditCard: this.data.paymentCreditCard
            });
        this.save();
    }

    /**
     * オーダーID生成
     * @method createOrderId
     */
    private createOrderId() {
        if (this.data.seatReservationAuthorization === undefined
            || this.data.seatReservationAuthorization.result === undefined
            || this.data.screeningEvent === undefined) {
            throw new Error('status is different');
        }
        const DIGITS = {
            '02': -2,
            '08': -8
        };
        const orderCount = `00${this.data.orderCount}`.slice(DIGITS['02']);
        const tmpReserveNum =
            `00000000${this.data.seatReservationAuthorization.id}`.slice(DIGITS['08']);
        const theaterCode = this.data.screeningEvent.superEvent.location.branchCode;
        const reserveDate = moment().format('YYYYMMDD');
        this.data.orderCount += 1;
        // オーダーID 予約日 + 劇場ID(3桁) + 予約番号(8桁) + オーソリカウント(2桁)
        return `${reserveDate}${theaterCode}${tmpReserveNum}${orderCount}`;
    }

    /**
     * 購入登録処理
     */
    public async purchaseRegistrationProcess() {
        if (this.data.transaction === undefined
            || this.data.screeningEvent === undefined) {
            throw new Error('status is different');
        }
        await this.cinerino.getServices();
        let order: factory.order.IOrder;
        if (this.isReserveMvtk()) {
            // 決済方法として、ムビチケを追加する
            // const createMvtkAuthorizationArgs = {
            //     transactionId: this.data.transaction.id,
            //     mvtk: {
            //         typeOf: factory.action.authorize.discount.mvtk.ObjectType.Mvtk,
            //         price: this.getMvtkTotalPrice(),
            //         seatInfoSyncIn: this.getMvtkSeatInfoSync()
            //     }
            // };
            // console.log('createMvtkAuthorizationArgs', createMvtkAuthorizationArgs);
            // this.data.mvtkAuthorization =
            //     await this.cinerino.transaction.placeOrder.createMvtkAuthorization(createMvtkAuthorizationArgs);
        }
        // 取引確定
        order = (await this.cinerino.transaction.placeOrder.confirm({
            transactionId: this.data.transaction.id,
            sendEmailMessage: true
        })).order;
        const complete = {
            order: order,
            transaction: this.data.transaction,
            movieTheaterOrganization: this.data.movieTheaterOrganization,
            // incentive: this.data.incentive
        };
        this.storage.save('complete', complete, SaveType.Session);

        try {
            // Google Analytics
            const sendData = {
                hitType: 'event',
                eventCategory: 'purchase',
                eventAction: 'complete',
                eventLabel: `conversion-${this.data.screeningEvent.location.branchCode}`
            };
            ga('send', sendData);
        } catch (err) {
            console.error(err);
        }

        if (this.user.isNative()/* && !this.user.isMember()*/) {
            // アプリ非会員ならCognitoへ登録
            try {
                const reservationRecord = await this.awsCognito.getRecords({
                    datasetName: 'reservation'
                });
                if (reservationRecord.orders === undefined) {
                    reservationRecord.orders = [];
                }
                reservationRecord.orders.push(order);
                (<factory.order.IOrder[]>reservationRecord.orders).forEach((recordOrder, index) => {
                    const itemOffered = recordOrder.acceptedOffers[0].itemOffered;
                    if (itemOffered.typeOf !== factory.chevre.reservationType.EventReservation) {
                        return;
                    }
                    const endDate = moment(itemOffered.reservationFor.endDate).unix();
                    const limitDate = moment().subtract(1, 'month').unix();
                    if (endDate < limitDate) {
                        reservationRecord.orders.splice(index, 1);
                    }
                });
                const updateRecordsArgs = {
                    datasetName: 'reservation',
                    value: reservationRecord
                };
                await this.awsCognito.updateRecords(updateRecordsArgs);
            } catch (err) {
                console.error('awsCognito: updateRecords', err);
            }
        }
        // プッシュ通知登録
        try {
            const itemOffered = order.acceptedOffers[0].itemOffered;
            if (itemOffered.typeOf !== factory.chevre.reservationType.EventReservation) {
                throw new Error('itemOffered.typeOf is not EventReservation');
            }
            const reservationFor = itemOffered.reservationFor;
            const localNotificationArgs = {
                id: Number(order.orderNumber.replace(/\-/g, '')), // ID
                title: '鑑賞時間が近づいています。', // タイトル
                text: '劇場 / スクリーン: ' + reservationFor.superEvent.location.name.ja + '/' + reservationFor.location.name.ja + '\n' +
                    '作品名: ' + reservationFor.workPerformed.name + '\n' +
                    '上映開始: ' + moment(reservationFor.startDate).format('YYYY/MM/DD HH:mm'), // テキスト
                trigger: {
                    at: moment(reservationFor.startDate).subtract(30, 'minutes').toISOString() // 通知を送る時間（ISO）
                },
                foreground: true // 前面表示（デフォルトは前面表示しない）
            };
            this.callNative.localNotification(localNotificationArgs);
        } catch (err) {
            console.error(err);
        }

        // 購入情報削除
        this.reset();
    }

    /**
     * ムビチケ着券取り消し
     */
    /*public async cancelMvtksSatInfoSync(count: number) {
        // console.log('cancelMvtksSatInfoSync', count);
        try {
            // ムビチケ使用なら削除
            const deleteFlag = '1';
            const mvtksSatInfoSyncArgs = this.getMvtkSeatInfoSync({
                deleteFlag: deleteFlag
            });
            await this.cinerino.mvtksSeatInfoSync(mvtksSatInfoSyncArgs);
        } catch (err) {
            const limit = 3;
            if (count > limit) {
                throw err;
            }
            await this.cancelMvtksSatInfoSync(count + 1);
        }

    }*/

    /**
     * ムビチケ認証処理
     */
    public async mvtkAuthenticationProcess(movieTickets: {
        knyknrNo: string;
        pinCd: string;
    }[]) {
        if (this.data.screeningEvent === undefined
            || this.data.transaction === undefined) {
            throw new Error('status is different');
        }
        await this.cinerino.getServices();
        const transaction = this.data.transaction;
        const eventInfo = this.data.screeningEvent;

        const checkMovieTicketAction = await this.cinerino.payment.checkMovieTicket({
            typeOf: factory.paymentMethodType.MovieTicket,
            movieTickets: <any[]>movieTickets.map((movieTicket) => {
                return {
                    identifier: movieTicket.knyknrNo,
                    accessCode: movieTicket.pinCd,
                    typeOf: factory.paymentMethodType.MovieTicket,
                    serviceType: '', // 情報空でよし
                    serviceOutput: {
                        reservationFor: {
                            typeOf: eventInfo.typeOf,
                            id: eventInfo.id
                        },
                        reservedTicket: {
                            ticketedSeat: {
                                typeOf: factory.chevre.placeType.Seat,
                                seatingType: '', // 情報空でよし
                                seatNumber: '', // 情報空でよし
                                seatRow: '', // 情報空でよし
                                seatSection: '' // 情報空でよし
                            }
                        }
                    }
                };
            }),
            seller: {
                typeOf: transaction.seller.typeOf,
                id: transaction.seller.id
            }
        });

        this.data.mvtkTickets = [checkMovieTicketAction];
        this.save();
    }

    /**
     * 券種金額取得
     */
    public getTicketPrice(ticket: ISalesTicketResult) {
        const unitPriceSpecification = ticket.priceSpecification.priceComponent
            .filter((s) => s.typeOf === factory.chevre.priceSpecificationType.UnitPriceSpecification)
            .shift();
        const videoFormatCharge = ticket.priceSpecification.priceComponent
            .filter((s) => s.typeOf === factory.chevre.priceSpecificationType.VideoFormatChargeSpecification)
            .shift();
        const soundFormatCharge = ticket.priceSpecification.priceComponent
            .filter((s) => s.typeOf === factory.chevre.priceSpecificationType.SoundFormatChargeSpecification)
            .shift();
        const price = {
            unitPriceSpecification: (unitPriceSpecification === undefined) ? 0 : unitPriceSpecification.price,
            videoFormatCharge: (videoFormatCharge === undefined) ? 0 : videoFormatCharge.price,
            soundFormatCharge: (soundFormatCharge === undefined) ? 0 : soundFormatCharge.price,
            total: 0
        };

        price.total = price.unitPriceSpecification + price.videoFormatCharge + price.soundFormatCharge;

        return price;
    }
}
