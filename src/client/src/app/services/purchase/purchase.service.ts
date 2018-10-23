import { Injectable } from '@angular/core';
import * as factory from '@toei-jp/cinerino-factory';
import * as moment from 'moment';
import { IReservationTicket, Reservation } from '../../models';
import { TimeFormatPipe } from '../../pipes/time-format/time-format.pipe';
import { CinerinoService } from '../cinerino/cinerino.service';
import { SaveType, StorageService } from '../storage/storage.service';

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
    /**
     * ムビチケ承認情報
     */
    authorizeMovieTicketPayment?: factory.action.authorize.paymentMethod.movieTicket.IAction;
}

export interface IGmoTokenObject {
    token: string;
    toBeExpiredAt: string;
    maskedCardNo: string;
    isSecurityCodeSet: boolean;
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
        private cinerino: CinerinoService
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
                reservations: []
            };

            return;
        }
        const reservations = data.reservations.map(reservation => new Reservation(reservation));
        data.reservations = reservations;
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
     * オンライン表示判定
     * @method isOnlineDisplay
     * @param {factory.chevre.event.screeningEvent.IEvent} screeningEvent
     * @returns {boolean}
     */
    public isOnlineDisplay(screeningEvent: factory.chevre.event.screeningEvent.IEvent): boolean {
        if (screeningEvent.onlineDisplayStartDate === undefined) {
            // 一旦true
            return true;
        }
        return moment(screeningEvent.onlineDisplayStartDate).unix() <= moment().unix();
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
        const selectedReservations = this.data.reservations.filter((reservation) => {
            return (reservation.ticket !== undefined);
        });
        selectedReservations.forEach((reservation) => {
            if (reservation.ticket === undefined) {
                return;
            }
            result += reservation.getTicketPrice().total;
        });

        return result;
    }

    /**
     * ムビチケ合計金額計算
     * @method getTotalPrice
     */
    public getMvtkTotalPrice(): number {
        let result = 0;
        const selectedReservations = this.data.reservations.filter((reservation) => {
            return (reservation.ticket !== undefined);
        });
        selectedReservations.forEach((reservation) => {
            if (reservation.ticket === undefined) {
                return;
            }
            result += reservation.getTicketPrice().movieTicketTypeCharge;
        });

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
     * ムビチケでの予約判定
     * @method isReserveMvtk
     * @returns {boolean}
     */
    public isReserveMvtk(): boolean {
        const movieTickets = this.data.reservations.filter(reservation => reservation.isMovieTicket());

        return (movieTickets.length > 0);
    }

    /**
     * 取引開始処理
     * @method transactionStartProcess
     */
    public async transactionStartProcess(args: {
        passportToken: string;
        screeningEvent: factory.chevre.event.screeningEvent.IEvent;
        customerContact?: ICustomerContact;
    }) {
        // 購入データ削除
        this.reset();
        this.data.customerContact = args.customerContact;
        this.data.screeningEvent = args.screeningEvent;
        await this.cinerino.getServices();
        // 劇場のショップを検索
        this.data.movieTheaterOrganization = (await this.cinerino.organization.searchMovieTheaters({
            location: { branchCodes: [this.data.screeningEvent.superEvent.location.branchCode] }
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
            || this.data.seatReservationAuthorization === undefined) {
            throw new Error('status is different');
        }
        const transaction = this.data.transaction;
        const seatReservationAuthorization = this.data.seatReservationAuthorization;
        await this.cinerino.getServices();
        await this.cinerino.transaction.placeOrder.voidSeatReservation({
            transactionId: transaction.id,
            actionId: seatReservationAuthorization.id
        });
        this.data.seatReservationAuthorization = undefined;
        this.reset();
    }

    /**
     * 座席登録処理
     * @method seatRegistrationProcess
     */
    public async seatRegistrationProcess() {
        if (this.data.transaction === undefined
            || this.data.screeningEvent === undefined) {
            throw new Error('status is different');
        }
        await this.cinerino.getServices();
        // 予約中なら座席削除
        if (this.data.seatReservationAuthorization !== undefined) {
            await this.cinerino.transaction.placeOrder.voidSeatReservation({
                transactionId: this.data.transaction.id,
                actionId: this.data.seatReservationAuthorization.id
            });
            this.data.seatReservationAuthorization = undefined;
            this.save();
        }

        this.data.seatReservationAuthorization =
            await this.cinerino.transaction.placeOrder.authorizeSeatReservation({
                transactionId: this.data.transaction.id,
                event: {
                    id: this.data.screeningEvent.id
                },
                notes: '',
                clientUser: this.data.transaction.object.clientUser,
                acceptedOffer: this.data.reservations.map((reservation) => ({
                    ticketedSeat: {
                        seatSection: reservation.seat.seatSection,
                        seatNumber: reservation.seat.seatNumber,
                        seatRow: '',
                        seatingType: '',
                        typeOf: factory.chevre.placeType.Seat
                    },
                    id: (<IReservationTicket>reservation.ticket).ticketOffer.id
                }))
            });
        this.data.reservations.forEach((reservation) => {
            reservation.ticket = undefined;
        });
        this.data.orderCount = 0;
        this.save();
    }

    /**
     * 券種登録処理
     * @method ticketRegistrationProcess
     */
    public async ticketRegistrationProcess() {
        if (this.data.transaction === undefined
            || this.data.screeningEvent === undefined) {
            throw new Error('status is different');
        }
        await this.cinerino.getServices();
        // 予約中なら座席削除
        if (this.data.seatReservationAuthorization !== undefined) {
            await this.cinerino.transaction.placeOrder.voidSeatReservation({
                transactionId: this.data.transaction.id,
                actionId: this.data.seatReservationAuthorization.id
            });
            this.data.seatReservationAuthorization = undefined;
            this.save();
        }

        this.data.seatReservationAuthorization =
            await this.cinerino.transaction.placeOrder.authorizeSeatReservation({
                transactionId: this.data.transaction.id,
                event: {
                    id: this.data.screeningEvent.id
                },
                notes: '',
                clientUser: this.data.transaction.object.clientUser,
                acceptedOffer: this.data.reservations.map((reservation) => ({
                    ticketedSeat: {
                        seatSection: reservation.seat.seatSection,
                        seatNumber: reservation.seat.seatNumber,
                        seatRow: '',
                        seatingType: '',
                        typeOf: factory.chevre.placeType.Seat
                    },
                    id: (<IReservationTicket>reservation.ticket).ticketOffer.id
                }))
            });
        if (this.data.seatReservationAuthorization === undefined) {
            throw new Error('status is different');
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
            || this.data.screeningEvent === undefined
            || this.data.seatReservationAuthorization === undefined) {
            throw new Error('status is different');
        }
        const transaction = this.data.transaction;
        const screeningEvent = this.data.screeningEvent;
        const authorizeSeatReservation = this.data.seatReservationAuthorization;
        const reservations = this.data.reservations;
        await this.cinerino.getServices();
        let order: factory.order.IOrder;
        if (this.isReserveMvtk()) {
            if (this.data.authorizeMovieTicketPayment !== undefined) {
                await this.cinerino.transaction.placeOrder.voidMovieTicketPayment({
                    transactionId: transaction.id,
                    actionId: this.data.authorizeMovieTicketPayment.id
                });
            }
            // 決済方法として、ムビチケを追加する
            this.data.authorizeMovieTicketPayment =
                await this.cinerino.transaction.placeOrder.authorizeMovieTicketPayment({
                    transactionId: transaction.id,
                    typeOf: factory.paymentMethodType.MovieTicket,
                    amount: 0,
                    movieTickets: this.createMovieTicketsFromAuthorizeSeatReservation({
                        authorizeSeatReservation, reservations
                    })
                });
        }
        // 取引確定
        order = (await this.cinerino.transaction.placeOrder.confirm({
            transactionId: transaction.id,
            sendEmailMessage: true
        })).order;
        const complete = {
            order,
            transaction,
            movieTheaterOrganization: this.data.movieTheaterOrganization
        };
        this.storage.save('complete', complete, SaveType.Session);

        try {
            // Google Analytics
            const sendData = {
                hitType: 'event',
                eventCategory: 'purchase',
                eventAction: 'complete',
                eventLabel: `conversion-${screeningEvent.location.branchCode}`
            };
            ga('send', sendData);
        } catch (err) {
            console.error(err);
        }

        // 購入情報削除
        this.reset();
    }

    /**
     * 予約情報からムビチケ情報作成
     */
    private createMovieTicketsFromAuthorizeSeatReservation(args: {
        authorizeSeatReservation: factory.action.authorize.offer.seatReservation.IAction;
        reservations: Reservation[];
    }) {
        const results: factory.paymentMethod.paymentCard.movieTicket.IMovieTicket[] = [];
        const authorizeSeatReservation = args.authorizeSeatReservation;
        const reservations = args.reservations;
        if (authorizeSeatReservation.result === undefined) {
            return results;
        }
        const pendingReservations = authorizeSeatReservation.result.responseBody.object.reservations;

        pendingReservations.forEach((pendingReservation) => {
            const findReservationResult = reservations.find((reservation) => {
                return (reservation.seat.seatNumber === pendingReservation.reservedTicket.ticketedSeat.seatNumber);
            });
            if (findReservationResult === undefined
                || findReservationResult.ticket === undefined
                || findReservationResult.ticket.movieTicket === undefined) {
                return;
            }

            results.push({
                typeOf: factory.paymentMethodType.MovieTicket,
                identifier: findReservationResult.ticket.movieTicket.identifier,
                accessCode: findReservationResult.ticket.movieTicket.accessCode,
                serviceType: findReservationResult.ticket.movieTicket.serviceType,
                serviceOutput: {
                    reservationFor: {
                        typeOf: pendingReservation.reservationFor.typeOf,
                        id: pendingReservation.reservationFor.id
                    },
                    reservedTicket: { ticketedSeat: pendingReservation.reservedTicket.ticketedSeat }
                }
            });
        });

        return results;
    }

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
        const screeningEvent = this.data.screeningEvent;

        const checkMovieTicketAction = await this.cinerino.payment.checkMovieTicket({
            typeOf: factory.paymentMethodType.MovieTicket,
            movieTickets: movieTickets.map((movieTicket) => {
                const result: factory.paymentMethod.paymentCard.movieTicket.IMovieTicket = {
                    typeOf: <any>factory.paymentMethodType.MovieTicket,
                    identifier: movieTicket.knyknrNo,
                    accessCode: movieTicket.pinCd,
                    serviceType: '', // 情報空でよし
                    serviceOutput: {
                        reservationFor: {
                            typeOf: screeningEvent.typeOf,
                            id: screeningEvent.id
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

                return result;
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
        const result = {
            unitPriceSpecification: 0,
            videoFormatCharge: 0,
            soundFormatCharge: 0,
            movieTicketTypeCharge: 0,
            total: 0
        };
        const unitPriceSpecifications = ticket.priceSpecification.priceComponent
            .filter((s) => s.typeOf === factory.chevre.priceSpecificationType.UnitPriceSpecification);
        const videoFormatCharges = ticket.priceSpecification.priceComponent
            .filter((s) => s.typeOf === factory.chevre.priceSpecificationType.VideoFormatChargeSpecification);
        const soundFormatCharges = ticket.priceSpecification.priceComponent
            .filter((s) => s.typeOf === factory.chevre.priceSpecificationType.SoundFormatChargeSpecification);
        const movieTicketTypeCharges = ticket.priceSpecification.priceComponent
            .filter((s) => s.typeOf === factory.chevre.priceSpecificationType.MovieTicketTypeChargeSpecification);

        unitPriceSpecifications.forEach((unitPriceSpecification) => {
            result.unitPriceSpecification += unitPriceSpecification.price;
        });
        videoFormatCharges.forEach((videoFormatCharge) => {
            result.videoFormatCharge += videoFormatCharge.price;
        });
        soundFormatCharges.forEach((soundFormatCharge) => {
            result.soundFormatCharge += soundFormatCharge.price;
        });
        movieTicketTypeCharges.forEach((movieTicketTypeCharge) => {
            result.movieTicketTypeCharge += movieTicketTypeCharge.price;
        });
        result.total = result.unitPriceSpecification + result.videoFormatCharge + result.soundFormatCharge + result.movieTicketTypeCharge;

        return result;
    }
}
