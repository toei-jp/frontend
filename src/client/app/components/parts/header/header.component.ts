import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    public environment = environment;

    constructor() { }

    public ngOnInit() {
    }

}
