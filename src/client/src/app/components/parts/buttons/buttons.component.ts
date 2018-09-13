import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-buttons',
    templateUrl: './buttons.component.html',
    styleUrls: ['./buttons.component.scss']
})
export class ButtonsComponent implements OnInit {
    @Input() public nextLabel: string;
    @Input() public prevLabel: string;
    @Input() public prevLink: string;

    constructor() { }

    public ngOnInit() {
    }

}
