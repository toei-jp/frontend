import { Component, Input, OnInit } from '@angular/core';
import * as cinerino from '@cinerino/api-javascript-client';

type IScreeningEvent = cinerino.factory.chevre.event.screeningEvent.IEvent;
interface IFilmOrder {
    id: string;
    films: IScreeningEvent[];
}

@Component({
    selector: 'app-purchase-film-order',
    templateUrl: './purchase-film-order.component.html',
    styleUrls: ['./purchase-film-order.component.scss']
})
export class PurchaseFilmOrderComponent implements OnInit {
    @Input() public data: IFilmOrder;
    public info: IScreeningEvent;

    constructor() { }

    public ngOnInit() {
        this.info = this.data.films[0];
    }

}
