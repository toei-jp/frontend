import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { AwsCognitoService } from '../../../services/aws-cognito/aws-cognito.service';
import { CinerinoService } from '../../../services/cinerino/cinerino.service';
import { ErrorService } from '../../../services/error/error.service';
import { PurchaseService } from '../../../services/purchase/purchase.service';
import { SaveType, StorageService } from '../../../services/storage/storage.service';
import { UserService } from '../../../services/user/user.service';

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
        passportToken?: string;
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
        private awsCognito: AwsCognitoService,
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
            // if (!this.parametersChack()) {
            //     throw new Error('parameters is undefined');
            // }
            this.user.setNative(this.parameters.native);
            // this.user.setAccessToken(this.parameters.accessToken);
            this.user.save();
            // console.log('this.cinerino.auth', this.cinerino.auth);
            /*if (this.parameters.member === FlgMember.Member && !this.parameters.signInRedirect) {
                await this.cinerino.signIn();

                return;
            }*/

            // ticketアプリテスト
            // this.parameters.identityId = 'ap-northeast-1:c93ad6a4-47e6-4023-a078-2a9ea80c15c9';
            if (this.parameters.identityId !== undefined) {
                await this.awsCognito.authenticateWithDeviceId(this.parameters.identityId);
            }
            await this.cinerino.getServices();
            // イベント情報取得
            const screeningEvent = await this.cinerino.event.findScreeningEventById({
                id: (<string>this.parameters.performanceId)
            });
            // 開始可能日判定
            if (!this.purchase.isSales(screeningEvent)) {
                throw new Error('Unable to start sales');
            }
            const END_TIME = 30;
            // 終了可能日判定
            if (moment().add(END_TIME, 'minutes').unix() > moment(screeningEvent.startDate).unix()) {
                throw new Error('unable to end sales');
            }
            if (this.purchase.data.transaction !== undefined && this.purchase.isExpired()) {
                // 取引期限切れなら購入情報削除
                this.purchase.reset();
            }
            if (this.user.isNative()) {
                // アプリなら購入情報削除
                this.purchase.reset();
            }
            if (this.purchase.data.offers.length > 0) {
                // 重複確認へ
                this.storage.save('screeningEvent', screeningEvent, SaveType.Session);
                this.router.navigate([`/purchase/overlap`]);

                return;
            }

            await this.purchase.transactionStartProcess({
                passportToken: <string>this.parameters.passportToken,
                screeningEvent: screeningEvent
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
