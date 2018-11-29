import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as cinerino from '@cinerino/api-javascript-client';
import * as moment from 'moment';
import { SaveType, StorageService } from '../../../services/storage/storage.service';
// import { environment } from '../../../../environments/environment';

type IScreeningEvent = cinerino.factory.chevre.event.screeningEvent.IEvent;
interface Iavailability {
    text: string;
    className: string;
}

@Component({
    selector: 'app-purchase-film-order-performance',
    templateUrl: './purchase-film-order-performance.component.html',
    styleUrls: ['./purchase-film-order-performance.component.scss']
})
export class PurchaseFilmOrderPerformanceComponent implements OnInit {
    @Input() public data: IScreeningEvent;
    public availability: Iavailability;
    private isEndSale: boolean;
    private isStartSale: boolean;

    constructor(
        private storage: StorageService,
        private router: Router
    ) { }

    public ngOnInit() {
        const now = moment();
        this.isEndSale = (this.data.offers === undefined) ? false : moment(this.data.offers.validThrough) < now;
        this.isStartSale = (this.data.offers === undefined) ? false : moment(this.data.offers.validFrom) < now;
        this.availability = this.getAvailability(this.data.remainingAttendeeCapacity);
    }

    /**
     * @method getAvailability
     * @param {number | undefined} remaining
     * @returns {Iavailability}
     */
    public getAvailability(remaining?: number): Iavailability {
        const availabilityList = [
            { text: '完売', className: 'vacancy-full' },
            { text: '購入', className: 'vacancy-little' },
            { text: '購入', className: 'vacancy-large' },
            { text: '販売終了', className: 'outside-sales' },
            { text: '販売期間外', className: 'outside-sales' }
        ];

        return (this.isEndSale)
            ? availabilityList[3] : (!this.isStartSale)
                ? availabilityList[4] : (remaining === 0 || remaining === undefined)
                    ? availabilityList[0] : (remaining <= 10)
                        ? availabilityList[1] : availabilityList[2];
    }

    /**
     * @method start
     * @returns {void}
     */
    public start(): void {
        const availability = this.data.remainingAttendeeCapacity;
        if (availability === 0 || availability === undefined || !this.isStartSale || this.isEndSale) {
            return;
        }
        // location.href = `${environment.WAITER_SERVER_URL}/purchase/index.html?id=${this.data.identifier}`;
        this.storage.save('parameters', {
            passportToken: '',
            signInRedirect: false,
            performanceId: this.data.id
        }, SaveType.Session);
        this.router.navigate(['/purchase/transaction']);
    }

}
