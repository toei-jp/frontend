import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import * as moment from 'moment';
import { PurchaseService } from '../purchase/purchase.service';

@Injectable()
export class PurchaseGuardService implements CanActivate {

    constructor(
        private router: Router,
        private purchase: PurchaseService
    ) { }

    public canActivate(): boolean {
        if (this.purchase.data === undefined
            || this.purchase.data.transaction === undefined) {
            // console.log('transaction is undefined');
            this.router.navigate(['/error']);

            return false;
        }
        const expires = moment(this.purchase.data.transaction.expires).unix();
        if (expires < moment().unix()) {
            // console.log('transaction is expired');
            this.router.navigate(['/expired']);

            return false;
        }

        return true;
    }

}
