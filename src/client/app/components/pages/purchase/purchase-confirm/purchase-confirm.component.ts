import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { ErrorService, PurchaseService, UserService } from '../../../../services';

@Component({
    selector: 'app-purchase-confirm',
    templateUrl: './purchase-confirm.component.html',
    styleUrls: ['./purchase-confirm.component.scss']
})
export class PurchaseConfirmComponent implements OnInit {
    public confirmForm: FormGroup;
    public isLoading: boolean;
    public disable: boolean;
    public environment = environment;

    constructor(
        public purchase: PurchaseService,
        public user: UserService,
        private formBuilder: FormBuilder,
        private router: Router,
        private error: ErrorService
    ) { }

    public ngOnInit() {
        window.scrollTo(0, 0);
        this.isLoading = false;
        this.confirmForm = this.formBuilder.group({
            notes: [false, [Validators.requiredTrue]]
        });
        this.disable = false;
    }

    public async onSubmit() {
        if (this.disable) {
            return;
        }
        if (this.confirmForm.invalid) {
            this.confirmForm.controls.notes.markAsDirty();

            return;
        }
        this.disable = true;
        this.isLoading = true;
        if (this.purchase.isExpired()) {
            this.router.navigate(['expired']);

            return;
        }
        if (this.purchase.getTotalPrice() > 0) {
            try {
                // クレジットカード処理
                await this.purchase.creditCardPaymentProcess();
            } catch (err) {
                this.purchase.data.isCreditCardError = true;
                this.router.navigate(['/purchase/input']);
                return;
            }
        }
        try {
            await this.purchase.purchaseRegistrationProcess();
            this.router.navigate(['/purchase/complete']);
        } catch (err) {
            this.error.redirect(err);
        }
    }

    public changeScreeningEvent() {
        this.purchase.data.reservations = [];
        this.purchase.save();
        this.router.navigate(['/purchase/schedule']);
    }
}
