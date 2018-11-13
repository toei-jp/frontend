import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { ErrorService } from '../error/error.service';
import { UserService } from '../user/user.service';

@Injectable()
export class MemberGuardService implements CanActivate {

    constructor(
        private user: UserService,
        private error: ErrorService
    ) { }

    /**
     * 認証
     * @method canActivate
     */
    public async canActivate() {
        if (!this.user.isMember()) {
            this.error.redirect(new Error('非会員で使用することはできません。'));

            return false;
        }

        return true;
    }

}
