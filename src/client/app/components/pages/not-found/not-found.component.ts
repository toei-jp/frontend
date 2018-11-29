import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
@Component({
    selector: 'app-not-found',
    templateUrl: './not-found.component.html',
    styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {
    public environment = environment;
    constructor() { }

    public ngOnInit() {
    }

}
