import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import {
    CinerinoService,
    ErrorService,
    PurchaseService,
    SaveType,
    StorageService,
    UserService
} from '../../../../services';

@Component({
    selector: 'app-purchase-transaction',
    templateUrl: './purchase-transaction.component.html',
    styleUrls: ['./purchase-transaction.component.scss']
})
export class PurchaseTransactionComponent implements OnInit {
    public parameters: {
        /**
         * パフォーマンスId
         */
        performanceId?: string;
        /**
         * WAITER許可証トークン
         */
        passport?: { token: string; };
        /**
         * awsCognitoIdentityId
         */
        identityId?: string;
        /**
         * ネイティブアプリ
         */
        native?: string;
        /**
         * 会員
         */
        member?: string;
        /**
         * アクセストークン
         */
        accessToken?: string;
        /**
         * signinリダイレクト
         */
        signInRedirect: boolean;
    };
    constructor(
        private storage: StorageService,
        private router: Router,
        private cinerino: CinerinoService,
        private purchase: PurchaseService,
        private error: ErrorService,
        private user: UserService
    ) { }

    /**
     * 初期化
     */
    public async ngOnInit() {
        try {
            this.parameters = this.storage.load('parameters', SaveType.Session);
            if (!this.parameters.signInRedirect) {
                this.user.reset();
                this.user.load();
                this.user.save();
            }
            this.user.save();

            await this.cinerino.getServices();
            // イベント情報取得
            const screeningEvent = await this.cinerino.event.findScreeningEventById({
                id: (<string>this.parameters.performanceId)
            });
            // 開始可能日判定
            if (!this.purchase.isSales(screeningEvent)) {
                throw new Error('Unable to start sales');
            }

            // 終了可能日判定
            if (screeningEvent.offers !== undefined) {
                if (moment().unix() > moment(screeningEvent.offers.validThrough).unix()) {
                    throw new Error('Already finished selling');
                }
            }

            if (this.purchase.data.transaction !== undefined && this.purchase.isExpired()) {
                // 取引期限切れなら購入情報削除
                this.purchase.reset();
            }

            if (this.purchase.data.reservations.length > 0) {
                // 重複確認へ
                this.storage.save('screeningEvent', screeningEvent, SaveType.Session);
                this.router.navigate([`/purchase/overlap`]);

                return;
            }

            await this.purchase.transactionStartProcess({
                passport: this.parameters.passport,
                screeningEvent: screeningEvent,
                customerContact: this.purchase.data.customerContact
            });
            this.storage.remove('parameters', SaveType.Session);
            this.router.navigate(['/purchase/seat'], { replaceUrl: true });
        } catch (err) {
            this.error.redirect(err);
        }
    }

    /**
     * @method parametersChack
     * @requires {boolean}
     */
    // private parametersChack(): boolean {
    //     let result = true;
    //     if (this.parameters.passportToken === undefined
    //         || this.parameters.performanceId === undefined) {
    //         result = false;
    //     }

    //     return result;
    // }

}
