import { Component, Input, OnInit } from '@angular/core';
import * as cinerino from '@toei-jp/cinerino-api-javascript-client';
import { environment } from '../../../../environments/environment';

type IScreeningEvent = cinerino.factory.chevre.event.screeningEvent.IEventWithOffer;
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
        this.availability = this.getAvailability(this.data.offer.availability);
    }

    /**
     * @method getAvailability
     * @param {number | null} availability
     * @returns {Iavailability}
     */
    public getAvailability(availability: number | null): Iavailability {
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

        return (availability === 0 || availability === null)
            ? availabilityList[0] : (availability <= 10)
                ? availabilityList[1] : availabilityList[2];
    }

    /**
     * @method start
     * @returns {void}
     */
    public start(): void {
        const availability = this.data.offer.availability;
        if (availability === 0 || availability === null) {
            return;
        }
        location.href = `${environment.ENTRANCE_SERVER_URL}/purchase/index.html?id=${this.data.identifier}`;
    }

}
