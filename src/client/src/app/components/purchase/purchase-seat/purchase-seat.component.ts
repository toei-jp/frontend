import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { CinerinoService } from '../../../services/cinerino/cinerino.service';
import { ErrorService } from '../../../services/error/error.service';
import { ISalesTicketResult, IScreeningEvent, PurchaseService } from '../../../services/purchase/purchase.service';
// import { FlgMember, UserService } from '../../../services/user/user.service';
import { IInputScreenData, ISeat } from '../../parts/screen/screen.component';

@Component({
    selector: 'app-purchase-seat',
    templateUrl: './purchase-seat.component.html',
    styleUrls: ['./purchase-seat.component.scss']
})
export class PurchaseSeatComponent implements OnInit, AfterViewInit {
    public isLoading: boolean;
    public seatForm: FormGroup;
    public notSelectSeatModal: boolean;
    public upperLimitModal: boolean;
    public seats: ISeat[];
    public disable: boolean;
    public screenData: IInputScreenData;
    public environment = environment;

    constructor(
        public purchase: PurchaseService,
        private router: Router,
        private formBuilder: FormBuilder,
        private cinerino: CinerinoService,
        private error: ErrorService,
        // private user: UserService
    ) { }

    public ngOnInit() {
        window.scrollTo(0, 0);
        this.isLoading = true;
        this.notSelectSeatModal = false;
        this.seats = [];
        this.seatForm = this.formBuilder.group({
            terms: [false, [Validators.requiredTrue]]
        });
        this.disable = false;
        if (this.purchase.data.screeningEvent === undefined) {
            this.error.redirect(new Error('screeningEvent is undefined'));

            return;
        }

        this.screenData = {
            theaterCode: this.purchase.data.screeningEvent.superEvent.location.branchCode,
            // dateJouei: this.purchase.data.screeningEvent.info.dateJouei,
            titleCode: this.purchase.data.screeningEvent.superEvent.workPerformed.identifier,
            // titleBranchNum: this.purchase.data.screeningEvent.info.titleBranchNum,
            // timeBegin: this.purchase.data.screeningEvent.info.timeBegin,
            screenCode: this.purchase.data.screeningEvent.location.branchCode
        };

    }

    public async ngAfterViewInit() {
        if (this.purchase.data.salesTickets.length === 0) {
            this.purchase.data.salesTickets = await this.fitchSalesTickets();
        }
    }

    /**
     * スクリーン読み込み完了
     * @method loadScreen
     * @param {ISeat[]} seats
     */
    public loadScreen(seats: ISeat[]) {
        this.isLoading = false;
        this.seats = seats;
    }

    /**
     * 販売可能チケット情報取得
     * @method getSalesTickets
     */
    public async fitchSalesTickets() {
        const screeningEvent = <IScreeningEvent>this.purchase.data.screeningEvent;
        await this.cinerino.getServices();
        /*const salesTicketArgs = {
            theaterCode: screeningEvent.location.branchCode,
            dateJouei: screeningEvent.info.dateJouei,
            titleCode: screeningEvent.info.titleCode,
            // titleBranchNum: screeningEvent.info.titleBranchNum,
            timeBegin: screeningEvent.info.timeBegin
            // flgMember: (this.user.isMember()) ? FlgMember.Member : FlgMember.NonMember
        };*/
        const salesTickets = await this.cinerino.event.searchScreeningEventTicketTypes({
            eventId: screeningEvent.id
        });
        // console.log('salesTickets', salesTicketArgs, salesTickets);

        return salesTickets;
    }

    /**
     * 次へ
     * @method onSubmit
     */
    public async onSubmit() {
        if (this.seats.length === 0) {
            this.notSelectSeatModal = true;
            return;
        }
        if (this.disable) {
            return;
        }
        if (this.seatForm.invalid) {
            this.seatForm.controls.terms.markAsDirty();

            return;
        }
        this.disable = true;
        this.isLoading = true;
        if (this.purchase.isExpired()) {
            this.router.navigate(['expired']);

            return;
        }
        try {
            if (this.purchase.data.salesTickets.length === 0) {
                this.purchase.data.salesTickets = await this.fitchSalesTickets();
            }

            const offers = this.seats.map((seat) => {
                const salesTicket = (<ISalesTicketResult[]>this.purchase.data.salesTickets)[0];

                return {
                    seatSection: seat.section,
                    seatNumber: seat.code,
                    price: 0,
                    priceCurrency: '',
                    selected: false,
                    validation: false,
                    ticketInfo: {
                        ticketId: salesTicket.id,
                        ticketName: salesTicket.name,
                        ticketCount: 1,
                        description: salesTicket.description,
                        charge: salesTicket.charge,
                        seatNum: seat.code,
                        mvtkNum: '',
                        mvtkAppPrice: 0,
                        mvtkSalesPrice: 0,
                        mvtkKbnDenshiken: '00',
                        mvtkKbnKensyu: '00',
                        kbnEisyahousiki: '00',
                        mvtkKbnMaeuriken: '00'
                    }
                };
            });
            await this.purchase.seatRegistrationProcess(offers);
            this.router.navigate(['/purchase/ticket']);
        } catch (err) {
            this.error.redirect(err);
        }
    }

    /**
     * 座席選択
     * @method seatSelect
     * @param {Iseat[]} seats
     */
    public seatSelect(seats: ISeat[]) {
        this.seats = seats;
    }

    /**
     * 座席選択数警告
     * @method seatSelectionAlert
     */
    public seatSelectionAlert() {
        this.upperLimitModal = true;
    }

}

