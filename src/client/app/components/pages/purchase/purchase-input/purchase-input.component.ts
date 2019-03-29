import { Component, ElementRef, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { factory } from '@cinerino/api-javascript-client';
import * as libphonenumber from 'libphonenumber-js';
import * as moment from 'moment';
import { LibphonenumberFormatPipe } from '../../../../pipes/libphonenumber-format/libphonenumber-format.pipe';
import {
    ErrorService,
    IGmoTokenObject,
    PurchaseService,
    UserService
} from '../../../../services';

/**
 * クレジットカードタイプ
 */
enum CreditCardType {
    Input = 'input',
    Registered = 'registered'
}

@Component({
    selector: 'app-purchase-input',
    templateUrl: './purchase-input.component.html',
    styleUrls: ['./purchase-input.component.scss']
})
export class PurchaseInputComponent implements OnInit {
    public cardExpiration: {
        year: string[];
        month: string[];
    };
    public inputForm: FormGroup;
    public isLoading: boolean;
    public securityCodeModal: boolean;
    public creditCardAlertModal: boolean;
    public disable: boolean;
    public creditCardType: CreditCardType;

    constructor(
        public purchase: PurchaseService,
        public user: UserService,
        private elementRef: ElementRef,
        private formBuilder: FormBuilder,
        private router: Router,
        private error: ErrorService
    ) { }

    public async ngOnInit() {
        window.scrollTo(0, 0);
        this.isLoading = false;
        this.cardExpiration = {
            year: [],
            month: []
        };
        this.inputForm = this.createForm();
        this.disable = false;
        this.creditCardType = CreditCardType.Input;
        this.creditCardAlertModal = this.purchase.data.isCreditCardError;
        if (this.purchase.data.isCreditCardError) {
            // クレジットカードエラー
            this.purchase.data.isCreditCardError = false;
            this.inputForm.controls.cardNumber.markAsTouched();
            this.inputForm.controls.cardExpirationMonth.markAsTouched();
            this.inputForm.controls.cardExpirationYear.markAsTouched();
            this.inputForm.controls.securityCode.markAsTouched();
            this.inputForm.controls.holderName.markAsTouched();
            this.validationScroll();
        }
        this.securityCodeModal = false;
    }

    /**
     * バリデーションスクロール
     * @method validationScroll
     */
    private validationScroll() {
        setTimeout(() => {
            const element: HTMLElement = this.elementRef.nativeElement;
            const validation = <HTMLElement>element.querySelector('.validation');
            if (validation === null) {
                return;
            }
            const rect = validation.getBoundingClientRect();
            const scrollTop = window.pageYOffset || (<HTMLElement>document.documentElement).scrollTop;
            const top = rect.top + scrollTop - 50;
            window.scrollTo(0, top);
        }, 0);
    }

    /**
     * 次へ
     * @method onSubmit
     */
    public async onSubmit() {
        if (this.disable) {
            return;
        }

        if (this.inputForm.invalid) {
            // フォームのステータス変更
            this.inputForm.controls.familyName.markAsTouched();
            this.inputForm.controls.givenName.markAsTouched();
            this.inputForm.controls.email.markAsTouched();
            this.inputForm.controls.emailConfirm.markAsTouched();
            this.inputForm.controls.telephone.markAsTouched();
            if (this.purchase.getTotalPrice() > 0) {
                this.inputForm.controls.cardNumber.markAsTouched();
                this.inputForm.controls.cardExpirationMonth.markAsTouched();
                this.inputForm.controls.cardExpirationYear.markAsTouched();
                this.inputForm.controls.securityCode.markAsTouched();
                this.inputForm.controls.holderName.markAsTouched();
            }
            this.validationScroll();

            return;
        }
        if (this.inputForm.controls.email.value !== this.inputForm.controls.emailConfirm.value) {
            this.validationScroll();

            return;
        }
        if (this.purchase.isExpired()) {
            this.router.navigate(['expired']);

            return;
        }
        this.disable = true;
        this.isLoading = true;
        if (this.purchase.isExpired()) {
            this.router.navigate(['expired']);

            return;
        }
        try {
            if (this.purchase.data.transaction === undefined) {
                throw new Error('status is different');
            }
            if (this.purchase.getTotalPrice() > 0) {
                try {
                    if (this.creditCardType === CreditCardType.Input) {
                        this.purchase.data.gmoTokenObject = await this.getGmoObject();
                        this.purchase.data.paymentCreditCard = {
                            token: (<IGmoTokenObject>this.purchase.data.gmoTokenObject).token
                        };
                    } else {
                        if (this.user.data.creditCards === undefined) {
                            throw new Error('creditCards is undefined');
                        }
                        this.purchase.data.paymentCreditCard = {
                            memberId: 'me',
                            cardSeq: Number(this.user.data.creditCards[0].cardSeq)
                        };
                    }
                } catch (err) {
                    console.error(err);
                    // クレジットカード処理失敗
                    this.isLoading = false;
                    this.creditCardAlertModal = true;
                    if (this.creditCardType === CreditCardType.Input) {
                        this.inputForm.controls.cardNumber.setValue('');
                        this.inputForm.controls.securityCode.setValue('');
                        this.inputForm.controls.holderName.setValue('');
                    }
                    this.disable = false;

                    return;
                }
            }

            const phoneNumber = libphonenumber.parse(this.inputForm.controls.telephone.value, 'JP');
            // 入力情報を登録
            const contact = {
                familyName: this.inputForm.controls.familyName.value,
                givenName: this.inputForm.controls.givenName.value,
                email: this.inputForm.controls.email.value,
                telephone: libphonenumber.formatNumber(phoneNumber, 'E.164')
            };
            await this.purchase.customerContactRegistrationProcess(contact);
            this.router.navigate(['/purchase/confirm']);
        } catch (err) {
            this.error.redirect(err);
        }
    }

    /**
     * GMOトークン取得
     * @method getGmoToken
     */
    private async getGmoObject(): Promise<IGmoTokenObject> {
        const sendParam = {
            cardno: this.inputForm.controls.cardNumber.value,
            expire: this.inputForm.controls.cardExpirationYear.value + this.inputForm.controls.cardExpirationMonth.value,
            securitycode: this.inputForm.controls.securityCode.value,
            holdername: this.inputForm.controls.holderName.value
        };
        // console.log(sendParam);
        return new Promise<IGmoTokenObject>((resolve, reject) => {
            if (
                this.purchase.data.seller === undefined ||
                this.purchase.data.seller.paymentAccepted === undefined
            ) {
                return reject(new Error('status is different'));
            }
            (<any>window).someCallbackFunction = function someCallbackFunction(response: any) {
                if (response.resultCode === '000') {
                    resolve(response.tokenObject);
                } else {
                    reject(new Error(response.resultCode));
                }
            };
            const creditCardPayment = this.purchase.data.seller.paymentAccepted.find((payment) => {
                return payment.paymentMethodType === factory.paymentMethodType.CreditCard;
            });
            if (creditCardPayment === undefined) {
                return reject(new Error('status is different'));
            }
            const { shopId } = (<factory.seller.ICreditCardPaymentAccepted>creditCardPayment).gmoInfo;
            const Multipayment = (<any>window).Multipayment;
            Multipayment.init(shopId);
            Multipayment.getToken(sendParam, (<any>window).someCallbackFunction);
        });
    }

    /**
     * フォーム作成
     * @method createForm
     */
    private createForm() {
        const payment = this.purchase.getTotalPrice();
        const NAME_MAX_LENGTH = 12;
        const MAIL_MAX_LENGTH = 50;
        const TEL_MAX_LENGTH = 11;
        const TEL_MIN_LENGTH = 9;
        const customerContact = {
            familyName: {
                value: '',
                validators: [
                    Validators.required,
                    Validators.maxLength(NAME_MAX_LENGTH),
                    Validators.pattern(/^[ぁ-ゞー]+$/)
                ]
            },
            givenName: {
                value: '',
                validators: [
                    Validators.required,
                    Validators.maxLength(NAME_MAX_LENGTH),
                    Validators.pattern(/^[ぁ-ゞー]+$/)
                ]
            },
            email: {
                value: '', validators: [
                    Validators.required,
                    Validators.maxLength(MAIL_MAX_LENGTH),
                    Validators.email
                ]
            },
            emailConfirm: {
                value: '', validators: [
                    Validators.required,
                    Validators.maxLength(MAIL_MAX_LENGTH),
                    Validators.email
                ]
            },
            telephone: {
                value: '', validators: [
                    Validators.required,
                    Validators.maxLength(TEL_MAX_LENGTH),
                    Validators.minLength(TEL_MIN_LENGTH),
                    Validators.pattern(/^[0-9]+$/),
                    (control: AbstractControl): ValidationErrors | null => {
                        const field = control.root.get('telephone');
                        if (field !== null) {
                            const parsedNumber = libphonenumber.parse(field.value, 'JP');
                            if (parsedNumber.phone === undefined) {
                                return { telephone: true };
                            }
                            const isValid = libphonenumber.isValidNumber(parsedNumber);
                            if (!isValid) {
                                return { telephone: true };
                            }
                        }

                        return null;
                    }
                ]
            },
            cardNumber: { value: '', validators: [Validators.required, Validators.pattern(/^[0-9]+$/)] },
            cardExpirationMonth: { value: '01', validators: [Validators.required] },
            cardExpirationYear: { value: moment().format('YYYY'), validators: [Validators.required] },
            securityCode: { value: '', validators: [Validators.required] },
            holderName: { value: '', validators: [Validators.required] }
        };

        if (this.purchase.data.customerContact !== undefined
            && this.purchase.data.customerContact.familyName !== undefined
            && this.purchase.data.customerContact.givenName !== undefined
            && this.purchase.data.customerContact.email !== undefined
            && this.purchase.data.customerContact.telephone !== undefined) {
            // 購入者情報入力済み
            customerContact.familyName.value = this.purchase.data.customerContact.familyName;
            customerContact.givenName.value = this.purchase.data.customerContact.givenName;
            customerContact.email.value = this.purchase.data.customerContact.email;
            customerContact.emailConfirm.value = this.purchase.data.customerContact.email;
            customerContact.telephone.value =
                new LibphonenumberFormatPipe().transform(this.purchase.data.customerContact.telephone);
        }
        if (payment > 0) {
            // 決済あり
            for (let i = 0; i < 12; i++) {
                const DIGITS = -2;
                this.cardExpiration.month.push(`0${String(i + 1)}`.slice(DIGITS));
            }
            for (let i = 0; i < 10; i++) {
                this.cardExpiration.year.push(moment().add(i, 'year').format('YYYY'));
            }

            return this.formBuilder.group({
                familyName: [customerContact.familyName.value, customerContact.familyName.validators],
                givenName: [customerContact.givenName.value, customerContact.givenName.validators],
                email: [customerContact.email.value, customerContact.email.validators],
                emailConfirm: [customerContact.emailConfirm.value, customerContact.emailConfirm.validators],
                telephone: [customerContact.telephone.value, customerContact.telephone.validators],
                cardNumber: [customerContact.cardNumber.value, customerContact.cardNumber.validators],
                cardExpirationMonth: [customerContact.cardExpirationMonth.value, customerContact.cardExpirationMonth.validators],
                cardExpirationYear: [customerContact.cardExpirationYear.value, customerContact.cardExpirationYear.validators],
                securityCode: [customerContact.securityCode.value, customerContact.securityCode.validators],
                holderName: [customerContact.holderName.value, customerContact.holderName.validators]
            });

        } else {
            // 決済なし
            return this.formBuilder.group({
                familyName: [customerContact.familyName.value, customerContact.familyName.validators],
                givenName: [customerContact.givenName.value, customerContact.givenName.validators],
                email: [customerContact.email.value, customerContact.email.validators],
                emailConfirm: [customerContact.emailConfirm.value, customerContact.emailConfirm.validators],
                telephone: [customerContact.telephone.value, customerContact.telephone.validators]
            });
        }
    }

    /**
     * クレジットカード情報入力へ変更
     */
    public changeInputCreditCard() {
        this.creditCardType = CreditCardType.Input;
        this.inputForm.controls.cardNumber.setValue('');
        this.inputForm.controls.cardExpirationMonth.setValue('01');
        this.inputForm.controls.cardExpirationYear.setValue(moment().format('YYYY'));
        this.inputForm.controls.securityCode.setValue('');
        this.inputForm.controls.holderName.setValue('');
    }

    /**
     * 登録済みクレジットカードへ変更
     */
    public changeRegisteredCreditCard() {
        this.creditCardType = CreditCardType.Registered;
        this.inputForm.controls.cardNumber.setValue('4111111111111111');
        this.inputForm.controls.cardExpirationMonth.setValue('01');
        this.inputForm.controls.cardExpirationYear.setValue(moment().format('YYYY'));
        this.inputForm.controls.securityCode.setValue('123');
        this.inputForm.controls.holderName.setValue('TEST');
    }

}
