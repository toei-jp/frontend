import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
    selector: 'app-purchase-step',
    templateUrl: './purchase-step.component.html',
    styleUrls: ['./purchase-step.component.scss']
})
export class PurchaseStepComponent implements OnInit {
    public url: string;
    constructor(
        private router: Router
    ) { }

    public ngOnInit() {
        this.changePage(this.router.url);
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.changePage(event.url);
            }
        });
    }

    /**
     * ページ変更
     * @method changePage
     */
    private changePage(url: string) {
        this.url = url;
    }

}
