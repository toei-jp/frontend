import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class ErrorService {
    public errorDetail: any;

    constructor(private router: Router) { }

    public redirect(error: any) {
        console.error(error);
        this.errorDetail = error;
        this.router.navigate(['/error']);
    }

}
