import { Injectable } from '@angular/core';
import { factory } from '@cinerino/api-javascript-client';
import * as moment from 'moment';
import * as util from 'util';
import { environment } from '../../../environments/environment';
import {
    // getPurchaseCompleteEnqueteTemplate,
    getPurchaseCompleteTemplate
} from '../../mails';
import { Reservation } from '../../models';
import { LibphonenumberFormatPipe } from '../../pipes/libphonenumber-format/libphonenumber-format.pipe';
import { TimeFormatPipe } from '../../pipes/time-format/time-format.pipe';
import { CinerinoService } from '../cinerino/cinerino.service';
import { SaveType, StorageService } from '../storage/storage.service';
import { UtilService } from '../util/util.service';

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
    seller?: factory.seller.IOrganization<factory.seller.IAttributes<factory.organizationType>>;
    /**
     * 販売可能チケット情報
     */
    salesTickets: ISalesTicketResult[];
    /**
     * 予約座席
     */
    seatReservationAuthorization?: factory.action.authorize.offer.seatReservation.IAction<factory.service.webAPI.Identifier.Chevre>;
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
    creditCardAuthorization?: factory.action.authorize.paymentMethod.creditCard.IAction;
    /**
     * 購入者情報
     */
    customerContact?: factory.person.IProfile;
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
    authorizeMovieTicketPayments: factory.action.authorize.paymentMethod.movieTicket.IAction[];
    /**
     * 外部連携情報
     */
    external?: {
        performanceId?: string;
        passportToken?: string;
    };
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
        private cinerino: CinerinoService,
        private utilService: UtilService
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
                reservations: [],
                authorizeMovieTicketPayments: []
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
            reservations: [],
            authorizeMovieTicketPayments: []

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
     * @param {factory.chevre.event.screeningEvent.IEvent} screeningEvent
     * @returns {boolean}
     */
    public isSales(screeningEvent: factory.chevre.event.screeningEvent.IEvent): boolean {
        // 万が一販売条件が見つからなければ、とりあえず販売可能
        if (screeningEvent.offers === undefined) {
            return true;
        }

        // TODO ひとまず無条件にしているので修正
        return true;
        // const now = moment().unix();

        // return moment(screeningEvent.offers.validFrom).unix() <= now
        //     && moment(screeningEvent.offers.validThrough).unix() >= now;
    }

    /**
     * オンライン表示判定
     * @param {factory.chevre.event.screeningEvent.IEvent} screeningEvent
     * @returns {boolean}
     */
    public isOnlineDisplay(screeningEvent: factory.chevre.event.screeningEvent.IEvent): boolean {
        // 万が一販売条件が見つからなければ、とりあえず表示可能
        if (screeningEvent.offers === undefined) {
            return true;
        }

        // TODO ひとまず無条件にしているので修正
        return true;
        // const now = moment().unix();

        // return moment(screeningEvent.offers.availabilityStarts).unix() <= now
        //     && moment(screeningEvent.offers.availabilityEnds).unix() >= now;
    }

    /**
     * 劇場名取得
     * @method getTheaterName
     * @returns {string}
     */
    public getTheaterName(): string {
        const screeningEvent = this.data.screeningEvent;
        if (screeningEvent === undefined
            || screeningEvent.superEvent.location.name === undefined
            || screeningEvent.superEvent.location.name.ja === undefined) {
            return '';
        }

        return screeningEvent.superEvent.location.name.ja;
    }

    /**
     * スクリーン名取得
     * @method getScreenName
     * @returns {string}
     */
    public getScreenName(): string {
        const screeningEvent = this.data.screeningEvent;
        if (screeningEvent === undefined) {
            return '';
        }
        const screen = {
            name: (screeningEvent.location.name === undefined
                || screeningEvent.location.name.ja === undefined)
                ? '' : screeningEvent.location.name.ja,
            address: (screeningEvent.location.address === undefined
                || screeningEvent.location.address.en === undefined)
                ? '' : screeningEvent.location.address.en
        };

        return `${screen.address} ${screen.name}`;
    }

    /**
     * 作品名取得
     * @method getTitle
     * @returns {string}
     */
    public getTitle(): string {
        const screeningEvent = this.data.screeningEvent;
        if (screeningEvent === undefined
            || screeningEvent.name === undefined
            || screeningEvent.name.ja === undefined) {
            return '';
        }

        return screeningEvent.name.ja;
    }

    /**
     * サブタイトル取得
     * @method getSubTitle
     * @returns {string}
     */
    public getSubTitle(): string {
        const screeningEvent = this.data.screeningEvent;
        if (screeningEvent === undefined
            || screeningEvent.workPerformed === undefined
            || screeningEvent.workPerformed.headline === undefined) {
            return '';
        }

        return screeningEvent.workPerformed.headline;
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
     * 券種金額取得
     */
    public getTicketPrice(ticket: factory.chevre.event.screeningEvent.ITicketOffer
        | factory.order.IAcceptedOffer<factory.order.IItemOffered>) {
        const result = {
            unitPriceSpecification: 0,
            movieTicketTypeCharge: 0,
            total: 0,
            single: 0
        };

        if (ticket.priceSpecification === undefined) {
            return result;
        }
        const priceComponent = (<factory.chevre.event.screeningEvent.ITicketPriceSpecification>ticket.priceSpecification).priceComponent;
        const priceSpecificationType = factory.chevre.priceSpecificationType;
        const unitPriceSpecifications = priceComponent.filter((s) => s.typeOf === priceSpecificationType.UnitPriceSpecification);
        const movieTicketTypeCharges = priceComponent.filter((s) => s.typeOf === priceSpecificationType.MovieTicketTypeChargeSpecification);

        result.unitPriceSpecification += unitPriceSpecifications[0].price;
        movieTicketTypeCharges.forEach((movieTicketTypeCharge) => {
            result.movieTicketTypeCharge += movieTicketTypeCharge.price;
        });
        result.total = result.unitPriceSpecification + result.movieTicketTypeCharge;

        const unitPriceSpecification = unitPriceSpecifications[0];
        if (unitPriceSpecification.typeOf === priceSpecificationType.UnitPriceSpecification) {
            const referenceQuantityValue = (unitPriceSpecification.referenceQuantity.value === undefined)
                ? 1
                : unitPriceSpecification.referenceQuantity.value;
            result.single = result.total / referenceQuantityValue;
        }

        return result;
    }

    /**
     * 合計金額計算
     * @method getTotalPrice
     */
    public getTotalPrice(): number {
        const filterResult = this.data.reservations.filter(reservation => reservation.ticket === undefined);
        if (filterResult.length > 0
            || this.data.seatReservationAuthorization === undefined
            || this.data.seatReservationAuthorization.result === undefined) {
            return 0;
        }

        return this.data.seatReservationAuthorization.result.price;
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
     */
    // public isUsedMvtk(): boolean {
    //     if (this.data.screeningEvent === undefined) {
    //         return false;
    //     }

    //     // 劇場作品の対応決済方法にムビチケが含まれていなければfalse
    //     if (this.data.screeningEvent.superEvent.offers !== undefined
    //         && Array.isArray(this.data.screeningEvent.superEvent.offers.acceptedPaymentMethod)
    //         && this.data.screeningEvent.superEvent.offers.acceptedPaymentMethod.indexOf(factory.paymentMethodType.MovieTicket) < 0) {
    //         return false;
    //     }

    //     // イベントの対応決済方法にムビチケが含まれていなければfalse
    //     if (this.data.screeningEvent.offers !== undefined
    //         && Array.isArray(this.data.screeningEvent.offers.acceptedPaymentMethod)
    //         && this.data.screeningEvent.offers.acceptedPaymentMethod.indexOf(factory.paymentMethodType.MovieTicket) < 0) {
    //         return false;
    //     }

    //     return true;
    // }

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
        passport?: { token: string };
        screeningEvent: factory.chevre.event.screeningEvent.IEvent;
        seller: factory.seller.IOrganization<factory.seller.IAttributes<factory.organizationType>>;
    }) {
        // 購入データ削除
        this.reset();
        this.data.screeningEvent = args.screeningEvent;
        this.data.seller = args.seller;
        await this.cinerino.getServices();
        // 取引期限
        const now = (await this.utilService.getServerDate()).date;
        const VALID_TIME = environment.TRANSACTION_TIME;
        const expires = moment(now).add(VALID_TIME, 'minutes').toDate();
        const passport = args.passport;
        // 取引開始
        this.data.transaction = await this.cinerino.transaction.placeOrder.start({
            expires: expires,
            seller: this.data.seller,
            object: { passport }
        });
        this.save();
    }

    /**
     * 取引キャンセル処理
     * @method transactionStartProcess
     */
    public async transactionCancelProcess() {
        if (this.data.transaction === undefined) {
            throw new Error('status is different');
        }
        const transaction = this.data.transaction;
        await this.cinerino.getServices();
        await this.cinerino.transaction.placeOrder.cancel(transaction);
        // 購入データ削除
        this.reset();
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
        const seatReservationAuthorization = this.data.seatReservationAuthorization;
        await this.cinerino.getServices();
        await this.cinerino.transaction.placeOrder.voidSeatReservation(seatReservationAuthorization);
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
            await this.cinerino.transaction.placeOrder.voidSeatReservation(this.data.seatReservationAuthorization);
            this.data.seatReservationAuthorization = undefined;
            this.save();
        }

        this.data.seatReservationAuthorization =
            <factory.action.authorize.offer.seatReservation.IAction<factory.service.webAPI.Identifier.Chevre>>
            await this.cinerino.transaction.placeOrder.authorizeSeatReservation({
                object: {
                    event: { id: this.data.screeningEvent.id },
                    acceptedOffer: this.data.reservations.map((r) => {
                        const id = (r.ticket === undefined) ? this.data.salesTickets[0].id : r.ticket.ticketOffer.id;
                        if (id === undefined) {
                            throw new Error('ticket or ticket.ticketOffer.id or salesTickets.id is undefined').message;
                        }
                        return {
                            id,
                            additionalProperty: [],
                            itemOffered: {
                                serviceOutput: {
                                    typeOf: factory.chevre.reservationType.EventReservation,
                                    additionalProperty: [],
                                    reservedTicket: {
                                        typeOf: <any>'Ticket',
                                        ticketedSeat: {
                                            seatSection: r.seat.seatSection,
                                            seatNumber: r.seat.seatNumber,
                                            seatRow: '',
                                            seatingType: '',
                                            typeOf: <any>factory.chevre.placeType.Seat
                                        },
                                    }
                                }
                            }
                        };
                    })
                },
                purpose: this.data.transaction
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
            await this.cinerino.transaction.placeOrder.voidSeatReservation(this.data.seatReservationAuthorization);
            this.data.seatReservationAuthorization = undefined;
            this.save();
        }

        this.data.seatReservationAuthorization =
            <factory.action.authorize.offer.seatReservation.IAction<factory.service.webAPI.Identifier.Chevre>>
            await this.cinerino.transaction.placeOrder.authorizeSeatReservation({
                object: {
                    event: { id: this.data.screeningEvent.id },
                    acceptedOffer: this.data.reservations.map((r) => {
                        const id = (r.ticket === undefined) ? undefined : r.ticket.ticketOffer.id;
                        if (id === undefined) {
                            throw new Error('ticket.ticketOffer.id is undefined').message;
                        }
                        return {
                            id,
                            additionalProperty: [],
                            itemOffered: {
                                serviceOutput: {
                                    typeOf: factory.chevre.reservationType.EventReservation,
                                    additionalProperty: [],
                                    reservedTicket: {
                                        typeOf: <any>'Ticket',
                                        ticketedSeat: {
                                            seatSection: r.seat.seatSection,
                                            seatNumber: r.seat.seatNumber,
                                            seatRow: '',
                                            seatingType: <any>'',
                                            typeOf: <any>factory.chevre.placeType.Seat
                                        }
                                    }
                                }
                            }
                        };
                    })
                },
                purpose: this.data.transaction
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
    public async customerContactRegistrationProcess(profile: factory.person.IProfile) {
        if (this.data.transaction === undefined) {
            throw new Error('transaction is undefined');
        }
        await this.cinerino.getServices();
        // 入力情報を登録
        this.data.customerContact = profile;
        await this.cinerino.transaction.placeOrder.setProfile({
            id: this.data.transaction.id,
            agent: profile
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
            await this.cinerino.payment.voidTransaction(this.data.creditCardAuthorization);
            this.data.creditCardAuthorization = undefined;
            this.save();
        }
        // クレジットカード登録
        const METHOD_LUMP = '1';
        this.data.creditCardAuthorization =
            await this.cinerino.payment.authorizeCreditCard({
                object: {
                    typeOf: factory.paymentMethodType.CreditCard,
                    orderId: this.createOrderId(),
                    amount: this.getTotalPrice(),
                    method: <any>METHOD_LUMP,
                    creditCard: this.data.paymentCreditCard
                },
                purpose: this.data.transaction
            });
        this.save();
    }

    /**
     * オーダーID生成
     * @method createOrderId
     */
    private createOrderId() {
        if (this.data.seatReservationAuthorization === undefined
            || this.data.transaction === undefined) {
            throw new Error('status is different');
        }
        const DIGITS = { '02': -2, '06': -6 };
        const prefix = environment.APP_PREFIX;
        const date = moment().format('YYMMDDHHmmss');
        const orderCount = `00${this.data.orderCount}`.slice(DIGITS['02']);
        const transactionId = `000000${this.data.transaction.id}`.slice(DIGITS['06']);
        this.data.orderCount += 1;
        this.save();
        return `${prefix}-${date}${transactionId}${orderCount}`;
    }

    /**
     * 購入登録処理
     */
    public async purchaseRegistrationProcess() {
        if (this.data.transaction === undefined
            || this.data.screeningEvent === undefined
            || this.data.seatReservationAuthorization === undefined
            || this.data.seller === undefined) {
            throw new Error('status is different');
        }
        const transaction = this.data.transaction;
        const authorizeSeatReservation = this.data.seatReservationAuthorization;
        const reservations = this.data.reservations;
        const seller = this.data.seller;
        await this.cinerino.getServices();
        let order: factory.order.IOrder;
        if (this.isReserveMvtk()) {
            if (this.data.authorizeMovieTicketPayments.length > 0) {
                for (const authorizeMovieTicketPayment of this.data.authorizeMovieTicketPayments) {
                    await this.cinerino.payment.voidTransaction(authorizeMovieTicketPayment);
                }
                this.data.authorizeMovieTicketPayments = [];
            }
            // 決済方法として、ムビチケを追加する
            const movieTickets = this.createMovieTicketsFromAuthorizeSeatReservation({
                authorizeSeatReservation, reservations, seller
            });
            const movieTicketIdentifiers: {
                identifier: string;
                movieTickets: factory.paymentMethod.paymentCard.movieTicket.IMovieTicket[]
            }[] = [];
            movieTickets.forEach((movieTicket) => {
                const findResult = movieTicketIdentifiers.find((movieTicketIdentifier) => {
                    return (movieTicketIdentifier.identifier === movieTicket.identifier);
                });
                if (findResult === undefined) {
                    movieTicketIdentifiers.push({
                        identifier: movieTicket.identifier, movieTickets: [movieTicket]
                    });
                    return;
                }
                findResult.movieTickets.push(movieTicket);

            });
            for (const movieTicketIdentifier of movieTicketIdentifiers) {
                const authorizeMovieTicketPaymentResult = await this.cinerino.payment.authorizeMovieTicket({
                    object: {
                        typeOf: factory.paymentMethodType.MovieTicket,
                        amount: 0,
                        movieTickets: movieTicketIdentifier.movieTickets
                    },
                    purpose: transaction
                });
                this.data.authorizeMovieTicketPayments.push(authorizeMovieTicketPaymentResult);
            }
        }
        // メールテンプレートパラメータ
        const mailParams = {
            order: { date: moment().format('YYYY年MM月DD日(ddd) HH:mm') },
            event: {
                startDate: moment(this.data.screeningEvent.startDate).format('YYYY年MM月DD日(ddd) HH:mm'),
                endDate: moment(this.data.screeningEvent.endDate).format('HH:mm')
            },
            workPerformedName: (this.data.screeningEvent.workPerformed === undefined)
                ? '' : this.data.screeningEvent.workPerformed.name,
            screen: {
                name: (this.data.screeningEvent.location.name === undefined
                    || this.data.screeningEvent.location.name.ja === undefined)
                    ? '' : this.data.screeningEvent.location.name.ja,
                address: (this.data.screeningEvent.location.address !== undefined
                    && this.data.screeningEvent.location.address.ja !== '')
                    ? `(${this.data.screeningEvent.location.address.ja})`
                    : ''
            },
            reservedSeats: this.data.reservations.map((reservation) => {
                return util.format(
                    '%s %s %s',
                    reservation.seat.seatNumber,
                    (reservation.ticket === undefined
                        || reservation.ticket.ticketOffer.name === undefined)
                        ? '' : (typeof reservation.ticket.ticketOffer.name === 'string')
                            ? reservation.ticket.ticketOffer.name : reservation.ticket.ticketOffer.name.ja,
                    `￥${reservation.getTicketPrice().single}`
                );
            }).join('\n| '),
            inquiryUrl: `${environment.SITE_URL}/inquiry/login`,
            seller: {
                telephone: (this.data.seller.telephone === undefined)
                    ? '' : new LibphonenumberFormatPipe().transform(this.data.seller.telephone)
            },
            theater: {
                branchCode: this.data.screeningEvent.superEvent.location.branchCode
            }
        };
        // 取引確定
        order = (await this.cinerino.transaction.placeOrder.confirm({
            id: transaction.id,
            sendEmailMessage: true,
            email: {
                sender: {
                    email: 'ticket@ml.smart-theater.com'
                },
                template: getPurchaseCompleteTemplate(mailParams)
            }
        })).order;
        const complete = {
            order,
            transaction,
            seller: this.data.seller
        };
        this.storage.save('complete', complete, SaveType.Session);

        // 購入情報削除
        this.reset();
    }

    /**
     * 予約情報からムビチケ情報作成
     */
    private createMovieTicketsFromAuthorizeSeatReservation(args: {
        authorizeSeatReservation: factory.action.authorize.offer.seatReservation.IAction<factory.service.webAPI.Identifier.Chevre>;
        reservations: Reservation[];
        seller: factory.seller.IOrganization<factory.seller.IAttributes<factory.organizationType>>
    }) {
        const results: factory.paymentMethod.paymentCard.movieTicket.IMovieTicket[] = [];
        const authorizeSeatReservation = args.authorizeSeatReservation;
        const reservations = args.reservations;
        const seller = args.seller;
        if (authorizeSeatReservation.result === undefined
            || authorizeSeatReservation.result.responseBody.object.reservations === undefined) {
            return results;
        }
        const pendingReservations = authorizeSeatReservation.result.responseBody.object.reservations;

        pendingReservations.forEach((pendingReservation) => {
            const findReservationResult = reservations.find((reservation) => {
                return (pendingReservation.reservedTicket.ticketedSeat !== undefined
                    && reservation.seat.seatNumber === pendingReservation.reservedTicket.ticketedSeat.seatNumber);
            });
            if (findReservationResult === undefined
                || findReservationResult.ticket === undefined
                || findReservationResult.ticket.movieTicket === undefined) {
                return;
            }
            if (pendingReservation.reservedTicket.ticketedSeat === undefined) {
                throw new Error('ticketedSeat is undefined');
            }

            results.push({
                project: seller.project,
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
    public async mvtkAuthenticationProcess(params: {
        movieTickets: {
            knyknrNo: string;
            pinCd: string;
        }[],
        seller: factory.seller.IOrganization<factory.seller.IAttributes<factory.organizationType>>
    }) {
        const movieTickets = params.movieTickets;
        const seller = params.seller;
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
                    project: seller.project,
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
                                seatingType: <any>'', // 情報空でよし
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

        return [checkMovieTicketAction];
    }
}
