import { Component, Input, OnInit } from '@angular/core';

const PURCHASE_NOTE = {
    '01': { ordinance: '東京都青少年の健全な育成に関する条例', limit: '23:00' },
    '02': { ordinance: '東京都青少年の健全な育成に関する条例', limit: '23:00' }
};

@Component({
    selector: 'app-purchase-note',
    templateUrl: './purchase-note.component.html',
    styleUrls: ['./purchase-note.component.scss']
})
export class PurchaseNoteComponent implements OnInit {

    @Input() public theaterCode: string;
    public ordinance: string;
    public limit: string;
    constructor() { }

    public ngOnInit() {
        this.ordinance = '';
        this.limit = '';
        if ((<any>PURCHASE_NOTE)[this.theaterCode] !== undefined) {
            this.ordinance = (<any>PURCHASE_NOTE)[this.theaterCode].ordinance;
            this.limit = (<any>PURCHASE_NOTE)[this.theaterCode].limit;
        }
    }

}
