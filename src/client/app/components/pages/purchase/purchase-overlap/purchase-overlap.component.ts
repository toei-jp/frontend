import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { factory } from '@cinerino/api-javascript-client';
import * as moment from 'moment';
import { CinerinoService, ErrorService, PurchaseService } from '../../../../services';

@Component({
    selector: 'app-purchase-overlap',
    templateUrl: './purchase-overlap.component.html',
    styleUrls: ['./purchase-overlap.component.scss']
})
export class PurchaseOverlapComponent implements OnInit {
    public screeningEvent: factory.chevre.event.screeningEvent.IEvent;
    public isLoading: boolean;
    constructor(
        public purchase: PurchaseService,
        private router: Router,
        private error: ErrorService,
        private activatedRoute: ActivatedRoute,
        private cinerino: CinerinoService
    ) { }

    public async ngOnInit() {
        window.scrollTo(0, 0);
        this.activatedRoute.paramMap
            .subscribe(async (params) => {
                this.isLoading = true;
                const performanceId = params.get('performanceId');
                try {
                    // イベント情報取得
                    await this.cinerino.getServices();
                    this.screeningEvent = await this.cinerino.event.findScreeningEventById({
                        id: <string>performanceId
                    });
                    if (this.screeningEvent === null) {
                        throw new Error('screeningEvent is null');
                    }
                    this.isLoading = false;
                } catch (err) {
                    this.error.redirect(err);
                }
            }).unsubscribe();
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
        this.isLoading = true;
        try {
            if (this.purchase.data.seatReservationAuthorization === undefined) {
                await this.purchase.transactionCancelProcess();
            } else {
                await this.purchase.cancelSeatRegistrationProcess();
            }
        } catch (err) {
            this.router.navigate(['/error']);
        }
        this.activatedRoute.paramMap
            .subscribe((params) => {
                const passportToken = params.get('passportToken');
                const performanceId = params.get('performanceId');
                this.router.navigate([`/purchase/transaction/${performanceId}/${passportToken}`]);
                this.isLoading = false;
            }).unsubscribe();
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
        const screen = {
            name: this.screeningEvent.location.name.ja,
            address: (this.screeningEvent.location.address === undefined)
                ? ''
                : this.screeningEvent.location.address.en
        };

        return `${screen.address} ${screen.name}`;
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
