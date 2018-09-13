import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Component({
    selector: 'app-icon',
    templateUrl: './icon.component.html',
    styleUrls: ['./icon.component.scss']
})
export class IconComponent implements OnInit {
    @Input() public iconName: string;
    @Input() public width?: number;
    @Input() public height?: number;
    public styles: SafeStyle;

    constructor(private sanitizer: DomSanitizer) { }

    public ngOnInit() {
        this.styles = this.sanitizer.bypassSecurityTrustStyle('');
        if (this.width !== undefined && this.height !== undefined) {
            const style = `width: ${this.width}px; height: ${this.height}px; background-size: ${this.width}px ${this.height}px;`;
            this.styles = this.sanitizer.bypassSecurityTrustStyle(style);
        }
    }

}
