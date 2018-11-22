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

    public scroll(event: Event) {
        event.preventDefault();
        const time = 10;
        let top = window.scrollY;
        const interval = setInterval(() => {
            if (top < 0) {
                clearInterval(interval);
            }
            top = top - 30;
            window.scrollTo(0, top);
        }, time);
    }

}
