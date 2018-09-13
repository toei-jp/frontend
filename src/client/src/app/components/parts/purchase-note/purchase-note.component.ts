import { Component, Input, OnInit } from '@angular/core';

const PURCHASE_NOTE = {
    '01': { ordinance: '東京都青少年健全育成条例', limit: '23:00' },
    '12': { ordinance: '徳島県青少年健全育成条例', limit: '23:00' },
    '18': { ordinance: '鹿児島県青少年保護育成条例', limit: '23:00' },
    '19': { ordinance: '千葉県青少年健全育成条例', limit: '23:00' }
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
        if (this.theaterCode === '01'
            || this.theaterCode === '12'
            || this.theaterCode === '18'
            || this.theaterCode === '19') {
            this.ordinance = PURCHASE_NOTE[this.theaterCode].ordinance;
            this.limit = PURCHASE_NOTE[this.theaterCode].limit;
        }
    }

}
