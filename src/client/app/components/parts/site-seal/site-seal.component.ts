import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-site-seal',
    templateUrl: './site-seal.component.html',
    styleUrls: ['./site-seal.component.scss']
})
export class SiteSealComponent implements OnInit {

    constructor() { }

    public ngOnInit() {
    }

    public verifySeal() {
        (<any>window).verifySeal();
    }

}
