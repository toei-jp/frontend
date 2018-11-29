import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-icon',
    templateUrl: './icon.component.html',
    styleUrls: ['./icon.component.scss']
})
export class IconComponent implements OnInit {
    @Input() public iconName: string;
    @Input() public width?: number;
    @Input() public height?: number;
    public styles: { [key: string]: string | number };

    constructor() { }

    public ngOnInit() {
        if (this.width !== undefined && this.height !== undefined) {
            this.styles = {
                'width.px': this.width,
                'height.px': this.height,
                'background-size': `${this.width}px ${this.height}px`
            };
        }
    }

}
