import { Component, Input, OnInit } from '@angular/core';
import * as cinerino from '@toei-jp/cinerino-api-javascript-client';
import { environment } from '../../../../environments/environment';

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

    constructor() { }

    public ngOnInit() {
        this.availability = this.getAvailability(this.data.remainingAttendeeCapacity);
    }

    /**
     * @method getAvailability
     * @param {number | undefined} availability
     * @returns {Iavailability}
     */
    public getAvailability(remaining?: number): Iavailability {
        const availabilityList = [
            {
                text: '満席',
                className: 'vacancy-full'
            },
            {
                text: '残りわずか',
                className: 'vacancy-little'
            },
            {
                text: '空席あり',
                className: 'vacancy-large'
            }
        ];

        return (remaining === 0 || remaining === undefined)
            ? availabilityList[0] : (remaining <= 10)
                ? availabilityList[1] : availabilityList[2];
    }

    /**
     * @method start
     * @returns {void}
     */
    public start(): void {
        const availability = this.data.remainingAttendeeCapacity;
        if (availability === 0 || availability === undefined) {
            return;
        }
        location.href = `${environment.ENTRANCE_SERVER_URL}/purchase/index.html?id=${this.data.identifier}`;
    }

}
