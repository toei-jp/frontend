import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorService, UserService } from '../../../../services';

@Component({
    selector: 'app-auth-signin',
    templateUrl: './auth-signin.component.html',
    styleUrls: ['./auth-signin.component.scss']
})
export class AuthSigninComponent implements OnInit {

    constructor(
        private router: Router,
        private user: UserService,
        private error: ErrorService
    ) { }

    public async ngOnInit() {
        try {
            // await this.user.initMember();
            this.user.save();
            this.router.navigate(['/']);
        } catch (err) {
            console.error(err);
            this.error.redirect(err);
        }
    }
}
