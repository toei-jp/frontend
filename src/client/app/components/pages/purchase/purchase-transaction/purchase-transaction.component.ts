import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import {
    CinerinoService,
    ErrorService,
    PurchaseService,
    SaveType,
    StorageService,
    UtilService
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
    };
    constructor(
        private storage: StorageService,
        private router: Router,
        private cinerino: CinerinoService,
        private purchase: PurchaseService,
        private util: UtilService,
        private error: ErrorService,
        private activatedRoute: ActivatedRoute
    ) { }

    /**
     * 初期化
     */
    public async ngOnInit() {
        this.activatedRoute.paramMap
            .subscribe(async (params) => {
                try {
                    const passportToken = params.get('passportToken');
                    const performanceId = params.get('performanceId');
                    if (performanceId === null) {
                        throw new Error('performanceId is null');
                    }
                    this.parameters = {
                        passport: (passportToken === null) ? undefined : { token: passportToken },
                        performanceId
                    };

                    await this.cinerino.getServices();
                    // イベント情報取得
                    const screeningEvent = await this.cinerino.event.findScreeningEventById({
                        id: (<string>this.parameters.performanceId)
                    });

                    const serverDate = await this.util.getServerDate();

                    // 開始可能日判定
                    if (screeningEvent.offers === undefined
                        || moment(screeningEvent.offers.validFrom) > moment(serverDate.date)) {
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
                        this.router.navigate([`/purchase/overlap/${performanceId}/${passportToken}`]);

                        return;
                    }

                    await this.purchase.transactionStartProcess({
                        passport: this.parameters.passport,
                        screeningEvent: screeningEvent
                    });
                    this.storage.remove('parameters', SaveType.Session);
                    this.router.navigate(['/purchase/seat'], { replaceUrl: true });
                } catch (err) {
                    this.error.redirect(err);
                }
            }).unsubscribe();
    }

}
