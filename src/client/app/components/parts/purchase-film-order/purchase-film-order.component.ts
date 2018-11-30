import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { factory } from '@cinerino/api-javascript-client';

interface IFilmOrder {
    id: string;
    films: factory.chevre.event.screeningEvent.IEvent[];
}

@Component({
    selector: 'app-purchase-film-order',
    templateUrl: './purchase-film-order.component.html',
    styleUrls: ['./purchase-film-order.component.scss']
})
export class PurchaseFilmOrderComponent implements OnInit {
    @Input() public data: IFilmOrder;
    @Output() public select = new EventEmitter<factory.chevre.event.screeningEvent.IEvent>();
    public info: factory.chevre.event.screeningEvent.IEvent;

    constructor() { }

    public ngOnInit() {
        this.info = this.data.films[0];
    }

}
