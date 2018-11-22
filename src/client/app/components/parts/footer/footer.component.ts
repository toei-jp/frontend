import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
    public environment = environment;
    public year: string;

    constructor() { }

    public ngOnInit() {
        this.year = moment().format('YYYY');
    }

}
