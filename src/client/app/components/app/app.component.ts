import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { UserService } from '../../services/user/user.service';

// declare const ga: Function;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    constructor(
        public user: UserService,
        private router: Router
    ) {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                // Googleアナリティクス pageview
                // try {
                //     ga('create', environment.ANALYTICS_ID, 'auto');
                //     ga('set', 'page', event.urlAfterRedirects);
                //     ga('send', 'pageview');
                // } catch (err) {
                //     console.error(err);
                // }
            }
        });
    }
}
