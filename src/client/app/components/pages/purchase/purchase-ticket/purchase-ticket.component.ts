import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { factory } from '@cinerino/api-javascript-client/lib/abstract';
import { environment } from '../../../../../environments/environment';
import { IReservationTicket, Reservation } from '../../../../models';
import { ErrorService, PurchaseService, UserService } from '../../../../services';

type IMovieTicketTypeChargeSpecification =
    factory.chevre.priceSpecification.IPriceSpecification<factory.chevre.priceSpecificationType.MovieTicketTypeChargeSpecification>;

@Component({
    selector: 'app-purchase-ticket',
    templateUrl: './purchase-ticket.component.html',
    styleUrls: ['./purchase-ticket.component.scss']
})
export class PurchaseTicketComponent implements OnInit {
    public totalPrice: number;
    public ticketsModal: boolean;
    public isLoading: boolean;
    public discountConditionsModal: boolean;
    public notSelectModal: boolean;
    public ticketForm: FormGroup;
    public disable: boolean;
    public selectedReservation: Reservation;
    public tickets: IReservationTicket[];
    public isUsedMovieTicket: boolean;

    constructor(
        public purchase: PurchaseService,
        public user: UserService,
        private formBuilder: FormBuilder,
        private router: Router,
        private error: ErrorService
    ) { }

    public ngOnInit() {
        // console.log(this.purchase.data.salesTickets);
        window.scrollTo(0, 0);
        this.purchase.load();
        this.isLoading = false;
        this.ticketsModal = false;
        this.discountConditionsModal = false;
        this.notSelectModal = false;
        this.ticketForm = this.formBuilder.group({});
        this.disable = false;
        this.tickets = [];
        try {
            this.totalPrice = this.getPrice();
        } catch (err) {
            this.error.redirect(err);
        }

        this.isUsedMovieTicket = this.movieTicketCheck();
    }

    /**
     * 次へ
     * @method onSubmit
     */
    public async onSubmit() {
        const selectedReservations = this.purchase.data.reservations.filter((reservation) => {
            return (reservation.ticket !== undefined);
        });
        if (selectedReservations.length === 0) {
            this.notSelectModal = true;

            return;
        }

        const validResult = selectedReservations.filter((reservation) => {
            const unitPriceSpecification = reservation.getUnitPriceSpecification();
            if (unitPriceSpecification === undefined
                || unitPriceSpecification.typeOf !== factory.chevre.priceSpecificationType.UnitPriceSpecification) {
                return false;
            }
            const filterResult = selectedReservations.filter((targetReservation) => {
                return (reservation.ticket !== undefined
                    && targetReservation.ticket !== undefined
                    && reservation.ticket.ticketOffer.id === targetReservation.ticket.ticketOffer.id);
            });
            const value = (unitPriceSpecification.referenceQuantity.value === undefined)
                ? 1
                : unitPriceSpecification.referenceQuantity.value;

            return (filterResult.length % value !== 0);
        });

        if (validResult.length > 0) {
            this.discountConditionsModal = true;

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
        try {
            await this.purchase.ticketRegistrationProcess();
            this.router.navigate(['/purchase/input']);
        } catch (err) {
            this.error.redirect(err);
        }
    }

    /**
     * 券種選択
     * @method openTicketList
     */
    public openTicketList(reservation: Reservation) {
        this.createTickets();
        this.selectedReservation = reservation;
        this.ticketsModal = true;
    }

    /**
     * 券種一覧作成
     */
    public createTickets() {
        this.tickets = [];
        const movieTickets: IReservationTicket[] = [];
        this.purchase.data.salesTickets.forEach((ticketOffer) => {
            const movieTicketTypeChargeSpecification = <IMovieTicketTypeChargeSpecification>ticketOffer.priceSpecification.priceComponent
                .filter((s) => s.typeOf === factory.chevre.priceSpecificationType.MovieTicketTypeChargeSpecification)
                .shift();
            if (movieTicketTypeChargeSpecification === undefined) {
                // ムビチケ以外
                if (environment.SPECIAL_TICKET_CODE.find(c => c === ticketOffer.id) !== undefined) {
                    this.tickets.unshift({ ticketOffer });
                    return;
                }
                this.tickets.push({ ticketOffer });
                return;
            }

            // 対象ムビチケ券
            const targetMovieTickets: factory.paymentMethod.paymentCard.movieTicket.IMovieTicket[] = [];
            this.purchase.data.mvtkTickets.forEach((checkMovieTicketAction) => {
                if (checkMovieTicketAction.result === undefined) {
                    return;
                }
                const availabilityMovieTickets = checkMovieTicketAction.result.movieTickets.filter((movieTicket) => {
                    return (movieTicket.validThrough === undefined);
                });
                availabilityMovieTickets.forEach((movieTicket) => {
                    if (movieTicket.serviceType === movieTicketTypeChargeSpecification.appliesToMovieTicketType) {
                        targetMovieTickets.push(movieTicket);
                    }
                });
            });

            // 選択中の対象ムビチケ券
            const reservations = this.purchase.data.reservations.filter((reservation) => {
                if (reservation.ticket === undefined
                    || reservation.ticket.movieTicket === undefined) {
                    return false;
                }
                return (movieTicketTypeChargeSpecification.appliesToMovieTicketType
                    === reservation.ticket.movieTicket.serviceType);
            });

            targetMovieTickets.forEach((movieTicket) => {
                const index = reservations.findIndex((reservation) => {
                    return (reservation.ticket !== undefined
                        && reservation.ticket.movieTicket !== undefined
                        && reservation.ticket.movieTicket.identifier === movieTicket.identifier);
                });
                if (index > -1) {
                    reservations.splice(index, 1);
                    return;
                }
                movieTickets.push({ ticketOffer, movieTicket });
            });
        });

        this.tickets = movieTickets.concat(this.tickets);
    }

    /**
     * 券種選択
     * @method selectTicket
     */
    public selectTicket(ticket: IReservationTicket) {
        const findReservationResult = this.purchase.data.reservations.find((reservation) => {
            return (reservation.seat.seatNumber === this.selectedReservation.seat.seatNumber
                && reservation.seat.seatSection === this.selectedReservation.seat.seatSection);
        });
        if (findReservationResult !== undefined) {
            findReservationResult.ticket = ticket;
        }
        this.purchase.save();

        this.totalPrice = this.getPrice();
        // this.upDateSalesTickets();
        this.ticketsModal = false;
    }

    /**
     * 合計金額取得
     */
    private getPrice() {
        let price = 0;
        this.purchase.data.reservations.forEach((reservation) => {
            price += reservation.getTicketPrice().single;
        });

        return price;
    }

    /**
     * ムビチケ対応確認
     */
    public movieTicketCheck() {
        const screeningEventTicketOffers = this.purchase.data.salesTickets;
        const movieTicketTypeOffers = screeningEventTicketOffers.filter((offer) => {
            const movieTicketTypeChargeSpecifications = offer.priceSpecification.priceComponent.filter((priceComponent) => {
                return (priceComponent.typeOf === factory.chevre.priceSpecificationType.MovieTicketTypeChargeSpecification);
            });
            return (movieTicketTypeChargeSpecifications.length > 0);
        });
        return (movieTicketTypeOffers.length > 0);
    }



}
