import { Component, Input, OnInit } from '@angular/core';
import * as cinerino from '@toei-jp/cinerino-api-javascript-client';

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
    public title: string;
    public duration: string;

    constructor() { }

    public ngOnInit() {
        this.title = this.data.films[0].name.ja;
        this.duration = this.data.films[0].workPerformed.duration;
    }

}
