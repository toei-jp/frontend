import { Component, OnInit } from '@angular/core';
import * as factory from '@toei-jp/cinerino-factory';
import * as moment from 'moment';
import { environment } from '../../../../environments/environment';
// import { CinerinoService } from '../../../services/cinerino/cinerino.service';
import { TimeFormatPipe } from '../../../pipes/time-format/time-format.pipe';
import { ErrorService } from '../../../services/error/error.service';
import { SaveType, StorageService } from '../../../services/storage/storage.service';
import { UserService } from '../../../services/user/user.service';

@Component({
    selector: 'app-purchase-complete',
    templateUrl: './purchase-complete.component.html',
    styleUrls: ['./purchase-complete.component.scss']
})
export class PurchaseCompleteComponent implements OnInit {
    public data: {
        order: factory.order.IOrder;
        transaction: factory.transaction.placeOrder.ITransaction;
        movieTheaterOrganization: factory.organization.movieTheater.IOrganization;
        // sendEmailNotification?: factory.task.sendEmailMessage.ITask
    };
    public environment = environment;

    constructor(
        private storage: StorageService,
        private error: ErrorService,
        // private cinerino: CinerinoService,
        public user: UserService
    ) { }

    public ngOnInit() {
        window.scrollTo(0, 0);
        this.data = this.storage.load('complete', SaveType.Session);
        if (this.data === null) {
            this.error.redirect(new Error('complete data is null'));
        }
        /*if (this.data.sendEmailNotification === undefined) {
            this.mailSendProcess(0).then().catch();
        }*/
    }

    /**
     * 印刷
     * @method print
     */
    public print() {
        print();
    }

    /**
     * 劇場名取得
     * @method getTheaterName
     * @returns {string}
     */
    public getTheaterName() {
        const itemOffered = this.data.order.acceptedOffers[0].itemOffered;
        if (itemOffered.typeOf !== factory.chevre.reservationType.EventReservation) {
            return '';
        }

        return itemOffered.reservationFor.superEvent.location.name.ja;
    }

    /**
     * スクリーン名取得
     * @method getScreenName
     * @returns {string}
     */
    public getScreenName() {
        const itemOffered = this.data.order.acceptedOffers[0].itemOffered;
        if (itemOffered.typeOf !== factory.chevre.reservationType.EventReservation) {
            return '';
        }

        return itemOffered.reservationFor.location.name.ja;
    }

    /**
     * 作品名取得
     * @method getTitle
     * @returns {string}
     */
    public getTitle() {
        const itemOffered = this.data.order.acceptedOffers[0].itemOffered;
        if (itemOffered.typeOf !== factory.chevre.reservationType.EventReservation) {
            return '';
        }

        return itemOffered.reservationFor.name.ja;
    }

    /**
     * 鑑賞日取得
     * @method getAppreciationDate
     * @returns {string}
     */
    public getAppreciationDate() {
        const itemOffered = this.data.order.acceptedOffers[0].itemOffered;
        if (itemOffered.typeOf !== factory.chevre.reservationType.EventReservation) {
            return '';
        }
        moment.locale('ja');

        return moment(itemOffered.reservationFor.startDate).format('YYYY年MM月DD日(ddd)');
    }

    /**
     * 上映開始時間取得
     * @method getStartDate
     * @returns {string}
     */
    public getStartDate() {
        const itemOffered = this.data.order.acceptedOffers[0].itemOffered;
        if (itemOffered.typeOf !== factory.chevre.reservationType.EventReservation) {
            return '';
        }
        return new TimeFormatPipe().transform(itemOffered.reservationFor.startDate);
    }

    /**
     * 上映終了取得
     * @method getEndDate
     * @returns {string}
     */
    public getEndDate() {
        const itemOffered = this.data.order.acceptedOffers[0].itemOffered;
        if (itemOffered.typeOf !== factory.chevre.reservationType.EventReservation) {
            return '';
        }
        return new TimeFormatPipe().transform(itemOffered.reservationFor.endDate);
    }

    /**
     * 照会URL取得
     * @method getInquiryUrl
     * @returns {string}
     */
    public getInquiryUrl() {
        const params = `theater=${this.data.movieTheaterOrganization.location.branchCode}&reserve=${this.data.order.confirmationNumber}`;
        return `${this.environment.FRONTEND_ENDPOINT}/inquiry/login?${params}`;
    }

    /**
     * メール送信処理
     */
    /*public async mailSendProcess(count: number) {
        try {
            const movieTheaterPlace = await this.cinerino.findMovieTheaterByBranchCode({
                branchCode: this.data.movieTheaterOrganization.location.branchCode
            });
            const text = (this.user.isNative())
                ? this.getAppMailText(movieTheaterPlace.telephone)
                : this.getMailText(movieTheaterPlace.telephone);
                const sendEmailNotificationArgs = {
                    transactionId: this.data.transaction.id,
                    emailMessageAttributes: {
                        typeOf: <any>factory.creativeWorkType.EmailMessage,
                        sender: {
                            name: this.data.order.seller.name,
                            email: 'noreply@ticket-cinemasunshine.com'
                        },
                        toRecipient: {
                            name: `${this.data.order.customer.familyName} ${this.data.order.customer.givenName}`,
                            email: this.data.order.customer.email
                        },
                        about: `${this.data.order.seller.name} 購入完了`,
                        text: text
                    }
                };
            this.data.sendEmailNotification =
                await this.cinerino.transaction.placeOrder.sendEmailNotification(sendEmailNotificationArgs);
            this.storage.save('complete', this.data, SaveType.Session);
        } catch (err) {
            const limit = 10;
            if (count < limit) {
                const timer = 1000;
                setTimeout(
                    () => {
                        this.mailSendProcess(count + 1);
                    },
                    timer
                );
            }
        }
    }*/

    public getMailText(telephone: string) {
        // tslint:disable:max-line-length
        return `${this.data.order.customer.familyName} ${this.data.order.customer.givenName} 様
この度は、${this.data.order.seller.name}のオンライン先売りチケットサービスにてご購入頂き、誠にありがとうございます。お客様がご購入されましたチケットの情報は下記の通りです。

[予約番号]
${this.data.order.confirmationNumber}

[鑑賞日時]
${this.getAppreciationDate()} ${this.getStartDate()} - ${this.getEndDate()}

[作品名]
${this.getTitle()}

[スクリーン名]
${this.getScreenName()}

[座席]
${this.data.order.acceptedOffers.map((offer) => {
                if (offer.itemOffered.typeOf !== factory.chevre.reservationType.EventReservation) {
                    return '';
                }
                return `${offer.itemOffered.reservedTicket.ticketedSeat} ${offer.itemOffered.reservedTicket.ticketType} ￥${offer.itemOffered.reservedTicket.totalPrice}`;
            }).join('\n')}
[合計]
￥${this.data.order.price}

【チケット発券について】
チケットの発券/入場方法は2通りからお選び頂けます。

<発券/入場方法1 入場用QRコードで入場>
以下のURLよりチケット情報確認画面へアクセス頂き、「チケットを購入した劇場」「予約番号」「お電話番号」を入力してログインしてください。 ご鑑賞時間の24時間前から入場用QRコードが表示されますので、入場時にそちらのQRコードをご提示ください。
${this.getInquiryUrl()}

<発券/入場方法2 劇場発券機で発券>
劇場に設置されている発券機にて発券頂きます。予約番号をお控えの上ご来場ください。
チケットが発券できなかった場合にはチケット売場にお越しください。

【ご注意事項】
・ご購入されたチケットの変更、キャンセル、払い戻しはいかなる場合でも致しかねます。
・チケットの発券にお時間がかかる場合もございますので、お時間の余裕を持ってご来場ください。
・メンバーズカード会員のお客様は、ポイントは付与いたしますので、発券したチケットまたは、表示されたQRコードとメンバーズカードをチケット売場までお持ちくださいませ。
・年齢や学生など各種証明が必要なチケットを購入された方は、入場時にご提示ください。
ご提示頂けない場合は、一般料金との差額を頂きます。

なお、このメールは、${this.data.order.seller.name}の予約システムでチケットをご購入頂いた方にお送りしておりますが、
チケット購入に覚えのない方に届いております場合は、下記お問い合わせ先までご連絡ください。
※なお、このメールアドレスは送信専用となっておりますので、ご返信頂けません。
ご不明な点がございましたら、下記番号までお問合わせください。

お問い合わせはこちら
${this.data.order.seller.name}
TEL：${telephone}`;
    }

}
