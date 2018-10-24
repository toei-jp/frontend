import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-law',
    templateUrl: './law.component.html',
    styleUrls: ['./law.component.scss']
})
export class LawComponent implements OnInit {
    public environment = environment;
    constructor() { }

    public ngOnInit() {
    }

}
