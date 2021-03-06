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
                const id = params.get('performanceId');
                try {
                    if (id === null) {
                        throw new Error('performanceId is null');
                    }
                    // イベント情報取得
                    await this.cinerino.getServices();
                    this.screeningEvent = await this.cinerino.event.findById<factory.chevre.eventType.ScreeningEvent>({ id });
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
            const params = await this.getUrlParams();
            if (params.performanceId === undefined) {
                this.router.navigate(['/error']);
                return;
            }
            const url = (params.passportToken === '')
                ? `/purchase/transaction/${params.performanceId}`
                : `/purchase/transaction/${params.performanceId}/${params.passportToken}`;
            this.router.navigate([url]);
            this.isLoading = false;
        } catch (err) {
            this.router.navigate(['/error']);
        }
    }

    /**
     * URLパラメータ取得
     */
    private async getUrlParams() {
        return new Promise<{
            passportToken?: string;
            performanceId?: string;
        }>((resolve) => {
            this.activatedRoute.paramMap
                .subscribe(async (params) => {
                    const passportToken = (params.get('passportToken'));
                    const performanceId = params.get('performanceId');
                    resolve({
                        passportToken: (passportToken === null) ? undefined : passportToken,
                        performanceId: (performanceId === null) ? undefined : performanceId
                    });
                })
                .unsubscribe();
        });
    }

    /**
     * 劇場名取得
     * @method getTheaterName
     * @returns {string}
     */
    public getTheaterName() {
        const screeningEvent = this.screeningEvent;
        if (screeningEvent.superEvent.location.name === undefined
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
    public getScreenName() {
        const screeningEvent = this.screeningEvent;
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
    public getTitle() {
        return this.screeningEvent.name.ja;
    }

    /**
     * サブタイトル取得
     * @method getSubTitle
     * @returns {string}
     */
    public getSubTitle() {
        const screeningEvent = this.screeningEvent;
        if (screeningEvent.workPerformed === undefined
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
