import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { factory } from '@cinerino/api-javascript-client';
import * as moment from 'moment';

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
    @Input() public data: factory.chevre.event.screeningEvent.IEvent;
    @Output() public select = new EventEmitter<factory.chevre.event.screeningEvent.IEvent>();
    public availability: Iavailability;
    private isEndSale: boolean;
    private isStartSale: boolean;

    constructor( ) { }

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

    public selectSchedule() {
        const availability = this.data.remainingAttendeeCapacity;
        if (availability === 0 || availability === undefined || !this.isStartSale || this.isEndSale) {
            return;
        }
        this.select.emit(this.data);
    }

}
