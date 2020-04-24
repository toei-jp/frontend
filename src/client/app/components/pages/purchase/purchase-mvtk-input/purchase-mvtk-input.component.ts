import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PurchaseService } from '../../../../services';

@Component({
    selector: 'app-purchase-mvtk-input',
    templateUrl: './purchase-mvtk-input.component.html',
    styleUrls: ['./purchase-mvtk-input.component.scss']
})
export class PurchaseMvtkInputComponent implements OnInit {
    public mvtkForms: FormGroup[];
    public mvtkInputForm: FormGroup;
    public inputValidationModal: boolean;
    public authErrorModal: boolean;
    public authWarningModal: boolean;
    public isLoading: boolean;
    public disable: boolean;
    public warningActions: { code: string; message: string; }[];

    constructor(
        public purchase: PurchaseService,
        private formBuilder: FormBuilder,
        private router: Router
    ) { }

    public ngOnInit() {
        window.scrollTo(0, 0);
        this.isLoading = false;
        this.inputValidationModal = false;
        this.authErrorModal = false;
        this.authWarningModal = false;
        this.mvtkForms = [];
        this.mvtkForms.push(this.createForm());
        this.mvtkInputForm = this.formBuilder.group({});
        this.disable = false;
        this.warningActions = [];
    }

    /**
     * フォーム作成
     * @method createForm
     */
    private createForm() {
        const CODE_LENGTH = 10;
        const PASSWORD_LENGTH = 4;
        return this.formBuilder.group({
            code: ['', [
                Validators.required,
                Validators.maxLength(CODE_LENGTH),
                Validators.minLength(CODE_LENGTH),
                Validators.pattern(/^[0-9]+$/)
            ]],
            password: ['', [
                Validators.required,
                Validators.maxLength(PASSWORD_LENGTH),
                Validators.minLength(PASSWORD_LENGTH),
                Validators.pattern(/^[0-9]+$/)
            ]]
        });
    }

    /**
     * ムビチケ券追加
     * @method addMvtk
     */
    public addMvtk() {
        this.mvtkForms.push(this.createForm());
    }

    /**
     * ムビチケ券削除
     * @method removeMvtk
     */
    public removeMvtk(index: number) {
        this.mvtkForms.splice(index, 1);
    }

    /**
     * ムビチケ認証
     */
    public async onSubmit() {
        this.mvtkForms.forEach((mvtkForm, index) => {
            const mvtkCodeList = document.querySelectorAll('.mvtk-code');
            const value = (<HTMLInputElement>mvtkCodeList[index]).value;
            mvtkForm.controls.code.setValue(value);
        });
        const mvtkForms = this.mvtkForms.filter((group) => {
            return (!group.invalid);
        });
        if (mvtkForms.length !== this.mvtkForms.length) {
            this.inputValidationModal = true;

            return;
        }
        if (this.disable) {
            return;
        }
        this.disable = true;
        this.isLoading = true;
        if (this.purchase.isExpired()) {
            this.router.navigate(['expired']);

            return;
        }
        if (this.purchase.data.seller === undefined) {
            this.router.navigate(['error']);

            return;
        }
        try {
            const mvtkData = mvtkForms.map((mvtkForm) => {
                return {
                    knyknrNo: mvtkForm.controls.code.value,
                    pinCd: mvtkForm.controls.password.value
                };
            });
            const checkMovieTicketActions = await this.purchase.mvtkAuthenticationProcess({
                movieTickets: mvtkData,
                seller: this.purchase.data.seller
            });
            this.warningActions = [];
            const checkMovieTicketAction = checkMovieTicketActions[0];
            if (checkMovieTicketAction === undefined
                || checkMovieTicketAction.result === undefined
                || checkMovieTicketAction.result.purchaseNumberAuthResult.knyknrNoInfoOut === null) {
                throw new Error('checkMovieTicketAction is undefined');
            }

            checkMovieTicketAction.result.purchaseNumberAuthResult.knyknrNoInfoOut.forEach((info) => {
                if (info.knyknrNoMkujyuCd !== undefined) {
                    this.warningActions.push({ code: info.knyknrNo, message: 'ムビチケ情報をご確認ください。' });
                }
                if (info.ykknmiNum === '0') {
                    this.warningActions.push({ code: info.knyknrNo, message: 'すでに使用済みのムビチケです。' });
                }
            });
            if (this.warningActions.length > 0) {
                this.isLoading = false;
                this.authWarningModal = true;
                this.disable = false;
                return;
            }
            this.purchase.data.mvtkTickets = checkMovieTicketActions;
            this.purchase.save();
            this.router.navigate(['purchase/mvtk/confirm']);
        } catch (err) {
            console.error(err);
            this.isLoading = false;
            this.authErrorModal = true;
            this.disable = false;
        }
    }

}
