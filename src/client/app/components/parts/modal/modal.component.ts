import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
    @Input() public open: boolean;
    @Input() public layout: boolean;
    @Output() public close = new EventEmitter();

    constructor() { }

    public ngOnInit() {
    }

}
