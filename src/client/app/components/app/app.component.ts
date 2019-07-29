import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { PurchaseService, UtilService } from '../../services';
import { UserService } from '../../services/user/user.service';

declare const ga: Function;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    public isRouter: boolean;
    constructor(
        public user: UserService,
        public purchase: PurchaseService,
        public util: UtilService,
        private router: Router
    ) {}

    /**
     * 初期化
     * @method ngOnInit
     */
    public async ngOnInit() {
        this.isRouter = false;
        if (environment.ANALYTICS_ID !== '') {
            this.analytics();
        }
        try {
            await this.external();
        } catch (error) {
            console.error(error);
        }
        this.isRouter = true;
    }

    /**
     * Googleアナリティクス pageview イベント
     */
    private analytics() {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                // Googleアナリティクス pageview
                try {
                    ga('create', environment.ANALYTICS_ID, 'auto');
                    ga('set', 'page', event.urlAfterRedirects);
                    ga('send', 'pageview');
                } catch (err) {
                    console.log(err);
                }
            }
        });
    }

    /**
     * 外部情報
     */
    public async external() {
        if (location.hash !== '') {
            return;
        }
        const external = await this.util.getExternal();
        this.purchase.data.external = external;
        this.purchase.save();
    }
}
