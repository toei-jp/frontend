/*import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as factory from '@toei-jp/chevre-factory';
import { CinerinoService } from '../../../services/cinerino/cinerino.service';
import { ErrorService } from '../../../services/error/error.service';
import { PurchaseService } from '../../../services/purchase/purchase.service';
import { FlgMember, UserService } from '../../../services/user/user.service';

@Component({
    selector: 'app-purchase-point',
    templateUrl: './purchase-point.component.html',
    styleUrls: ['./purchase-point.component.scss']
})
export class PurchasePointComponent implements OnInit {

    public isLoading: boolean;
    public pointTickets: factory.service.master.ITicketResult[];
    public ticketValueList: number[];
    public selectTickets: {
        [key: string]: number;
    };
    public pointAhortageAlertModal: boolean;
    public notSelectAlertModal: boolean;

    constructor(
        public user: UserService,
        private cinerino: CinerinoService,
        private purchase: PurchaseService,
        private error: ErrorService,
        private router: Router
    ) { }

    public async ngOnInit() {
        this.pointAhortageAlertModal = false;
        this.isLoading = true;
        this.pointTickets = [];
        this.selectTickets = {};
        try {
            if (this.purchase.data.screeningEvent === undefined) {
                throw new Error('screeningEvent is undefined');
            }
            if (this.purchase.data.tmpSeatReservationAuthorization === undefined
                || this.purchase.data.tmpSeatReservationAuthorization.result === undefined) {
                throw new Error('screeningEvent is undefined');
            }
            const reserveLength = this.purchase.data.tmpSeatReservationAuthorization.result.updTmpReserveSeatResult.listTmpReserve.length;
            this.ticketValueList = [];
            for (let i = 0; i < (reserveLength + 1); i++) {
                this.ticketValueList.push(i);
            }
            const screeningEvent = this.purchase.data.screeningEvent;
            const masterTickets = await this.cinerino.getTickets({
                theaterCode: screeningEvent.location.branchCode
            });
            this.pointTickets = masterTickets.filter((masterTicket) => {
                const salesTicket = this.purchase.data.salesTickets.find((ticket) => {
                    return ticket.ticketCode === masterTicket.ticketCode;
                });
                return (masterTicket.usePoint > 0
                    && masterTicket.flgMember === FlgMember.Member
                    && salesTicket !== undefined);
            });
            for (const pointTicket of this.pointTickets) {
                this.selectTickets[pointTicket.ticketCode] = 0;
            }
            // console.log('pointTickets', this.pointTickets);
        } catch (err) {
            this.error.redirect(err);
        }
        this.isLoading = false;
    }

    public onSubmit() {
        let usePoint = 0;
        for (const ticket of this.pointTickets) {
            usePoint += ticket.usePoint * this.selectTickets[ticket.ticketCode];
        }
        if (this.user.data.account === undefined) {
            this.error.redirect(new Error('account is undefined'));

            return;
        }
        if (usePoint === 0) {
            this.notSelectAlertModal = true;

            return;
        }
        if (this.user.data.account.availableBalance < usePoint) {
            this.pointAhortageAlertModal = true;

            return;
        }
        this.purchase.data.pointTickets = [];
        for (const ticket of this.pointTickets) {
            for (let i = 0; i < this.selectTickets[ticket.ticketCode]; i++) {
                this.purchase.data.pointTickets.push(ticket);
            }
        }
        this.purchase.save();
        this.router.navigate(['/purchase/ticket']);
    }

}*/
