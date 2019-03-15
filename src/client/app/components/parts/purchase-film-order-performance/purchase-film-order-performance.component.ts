import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { factory } from '@cinerino/api-javascript-client';
import * as moment from 'moment';

interface Iavailability {
    text: string;
    className: string;
    textClassName: string;
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

    constructor() { }

    public ngOnInit() {
        const now = moment();
        this.isEndSale = (this.data.offers === undefined) ? false : moment(this.data.offers.validThrough) < now;
        this.isStartSale = (this.data.offers === undefined) ? false : moment(this.data.offers.validFrom) < now;
        this.availability = this.getAvailability();
    }

    /**
     * @method getAvailability
     * @param {number | undefined} remaining
     * @returns {Iavailability}
     */
    public getAvailability(): Iavailability {
        const remainingAttendeeCapacity = this.data.remainingAttendeeCapacity;
        const maximumAttendeeCapacity = this.data.maximumAttendeeCapacity;
        const isNotSale = moment(this.data.startDate).add(-20, 'minutes').unix() < moment().unix();

        if (this.isEndSale) {
            return { text: '販売終了', className: 'outside-sales', textClassName: '' };
        } else if (!this.isStartSale) {
            return { text: '販売期間外', className: 'outside-sales', textClassName: '' };
        } else if (remainingAttendeeCapacity === 0
            || remainingAttendeeCapacity === undefined
            || maximumAttendeeCapacity === undefined) {
            return { text: '完売', className: 'vacancy-full', textClassName: '' };
        } else if (Math.floor(remainingAttendeeCapacity / maximumAttendeeCapacity * 100) < 30) {
            return { text: (isNotSale) ? '窓口' : '購入', className: 'vacancy-little', textClassName: (isNotSale) ? 'text-gray' : '' };
        } else {
            return { text: (isNotSale) ? '窓口' : '購入', className: 'vacancy-large', textClassName: (isNotSale) ? 'text-gray' : '' };
        }
    }

    public selectSchedule() {
        const availability = this.data.remainingAttendeeCapacity;
        if (availability === 0 || availability === undefined || !this.isStartSale || this.isEndSale) {
            return;
        }
        this.select.emit(this.data);
    }

}
