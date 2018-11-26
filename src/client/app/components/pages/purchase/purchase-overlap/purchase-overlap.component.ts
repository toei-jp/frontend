import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { factory } from '@cinerino/api-javascript-client';
import * as moment from 'moment';
import { ErrorService, PurchaseService, SaveType, StorageService } from '../../../../services';

@Component({
    selector: 'app-purchase-overlap',
    templateUrl: './purchase-overlap.component.html',
    styleUrls: ['./purchase-overlap.component.scss']
})
export class PurchaseOverlapComponent implements OnInit {
    public screeningEvent: factory.chevre.event.screeningEvent.IEvent;

    constructor(
        private storage: StorageService,
        public purchase: PurchaseService,
        private router: Router,
        private error: ErrorService
    ) { }

    public async ngOnInit() {
        window.scrollTo(0, 0);
        try {
            // イベント情報取得
            this.screeningEvent = <factory.chevre.event.screeningEvent.IEvent>this.storage.load('screeningEvent', SaveType.Session);
            if (this.screeningEvent === null) {
                throw new Error('screeningEvent is null');
            }
        } catch (err) {
            this.error.redirect(err);
        }
    }

    /**
     * 予約中のフローへ戻る
     */
    public returnTransaction() {
        this.router.navigate(['/purchase/seat']);
    }

    /**
     * 新しい取引へ
     */
    public async newTransaction() {
        try {
            if (this.purchase.data.seatReservationAuthorization === undefined) {
                await this.purchase.transactionCancelProcess();
            } else {
                await this.purchase.cancelSeatRegistrationProcess();
            }
        } catch (err) {
            console.error(err);
        }
        this.storage.remove('screeningEvent', SaveType.Session);
        this.storage.save('parameters', {
            passportToken: '',
            signInRedirect: false,
            performanceId: this.screeningEvent.id
        }, SaveType.Session);
        this.router.navigate(['/purchase/transaction']);
        // location.href = `${environment.WAITER_SERVER_URL}/purchase/index.html?id=${this.screeningEvent.identifier}`;
    }

    /**
     * 劇場名取得
     * @method getTheaterName
     * @returns {string}
     */
    public getTheaterName() {
        return this.screeningEvent.superEvent.location.name.ja;
    }

    /**
     * スクリーン名取得
     * @method getScreenName
     * @returns {string}
     */
    public getScreenName() {
        return this.screeningEvent.location.name.ja;
    }

    /**
     * 作品名取得
     * @method getTitle
     * @returns {string}
     */
    public getTitle() {
        return this.screeningEvent.name.ja;
    }

    /**
     * サブタイトル取得
     * @method getSubTitle
     * @returns {string}
     */
    public getSubTitle() {
        if (this.screeningEvent.workPerformed.headline === undefined
            || this.screeningEvent.workPerformed.headline === null) {
            return '';
        }

        return this.screeningEvent.workPerformed.headline;
    }

    /**
     * 鑑賞日取得
     * @method getAppreciationDate
     * @returns {string}
     */
    public getAppreciationDate() {
        moment.locale('ja');

        return moment(this.screeningEvent.startDate).format('YYYY年MM月DD日(ddd)');
    }

    /**
     * 上映開始時間取得
     * @method getStartDate
     * @returns {string}
     */
    // public getStartDate() {
    //     return new TimeFormatPipe().transform(this.screeningEvent.startDate);
    // }

    /**
     * 上映終了取得
     * @method getEndDate
     * @returns {string}
     */
    // public getEndDate() {
    //     return new TimeFormatPipe().transform(this.screeningEvent.endDate);
    // }

}
