import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BAD_REQUEST, TOO_MANY_REQUESTS } from 'http-status';
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
        try {
            const external = await this.purchase.data.external;
            const urlParams = await this.getUrlParams();
            const params = (external === undefined) ? urlParams : external;
            const performanceId = params.performanceId;
            if (performanceId === undefined) {
                throw new Error('performanceId is null');
            }

            await this.cinerino.getServices();
            // イベント情報取得
            const screeningEvent = await this.cinerino.event.findScreeningEventById({
                id: performanceId
            });
            const branchCode = screeningEvent.superEvent.location.branchCode;
            const sellerResult = await this.cinerino.seller.search({ location: { branchCodes: [branchCode] } });
            const seller = sellerResult.data[0];
            const passport = (params.passportToken === undefined)
                ? await this.cinerino.getPassport(seller.id)
                : { token: params.passportToken };

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
                this.router.navigate([`/purchase/overlap/${performanceId}/${passport.token}`]);

                return;
            }

            await this.purchase.transactionStartProcess({
                passport,
                screeningEvent: screeningEvent
            });
            this.storage.remove('parameters', SaveType.Session);
            this.router.navigate(['/purchase/seat'], { replaceUrl: true });
        } catch (error) {
            console.error(error);
            const status = error.status;
            if (status === TOO_MANY_REQUESTS) {
                this.router.navigate(['/congestion']);
                return;
            }
            if (status === BAD_REQUEST) {
                this.router.navigate(['/maintenance']);
                return;
            }
            this.error.redirect(error);
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

}
