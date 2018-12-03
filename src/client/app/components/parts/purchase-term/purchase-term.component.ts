import { Component, Input, OnInit } from '@angular/core';

const PURCHASE_TERM = {
    '01': { ordinance: '東京都青少年健全育成条例', limit: '23:00' }
};

@Component({
    selector: 'app-purchase-term',
    templateUrl: './purchase-term.component.html',
    styleUrls: ['./purchase-term.component.scss']
})
export class PurchaseTermComponent implements OnInit {
    @Input() public theaterCode: string;
    public ordinance: string;
    public limit: string;
    constructor() { }

    public ngOnInit() {
        this.ordinance = '';
        this.limit = '';
        if (this.theaterCode === '01') {
            this.ordinance = PURCHASE_TERM[this.theaterCode].ordinance;
            this.limit = PURCHASE_TERM[this.theaterCode].limit;
        }
    }

}
