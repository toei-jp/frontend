import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable()
export class TestGuardService implements CanActivate {

    constructor(
        private router: Router
    ) { }

    public canActivate(): boolean {
        if (environment.production) {
            this.router.navigate(['/error']);

            return false;
        }

        return true;
    }

}
