import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { factory } from '@cinerino/api-javascript-client';
import { SERVICE_UNAVAILABLE, TOO_MANY_REQUESTS } from 'http-status';
import * as moment from 'moment';
import { SwiperComponent, SwiperConfigInterface, SwiperDirective } from 'ngx-swiper-wrapper';
import { environment } from '../../../../../environments/environment';
import { CinerinoService, ErrorService, PurchaseService } from '../../../../services';

interface IFilmOrder {
    id: string;
    films: factory.chevre.event.screeningEvent.IEvent[];
}

interface IDate {
    value: string;
    label: {
        date: string,
        month: string,
        day: string
    };
}

/**
 * スケジュールタイプ
 */
enum ScheduleType {
    /**
     * 通常販売スケジュール
     */
    'Normal' = 'Normal',
    /**
     * 先行販売スケジュール
     */
    'Pre' = 'Pre'
}

@Component({
    selector: 'app-purchase-schedule',
    templateUrl: './purchase-schedule.component.html',
    styleUrls: ['./purchase-schedule.component.scss']
})
export class PurchaseScheduleComponent implements OnInit {
    public moment: typeof moment = moment;
    public theaters: factory.chevre.place.movieTheater.IPlaceWithoutScreeningRoom[];
    public isLoading: boolean;
    public showTheaterList: boolean;
    public dateList: IDate[];
    public filmOrder: IFilmOrder[];
    public schedules: factory.chevre.event.screeningEvent.IEvent[];
    public conditions: { theater: string; date: string };
    public environment = environment;
    public preSaleDateList: IDate[];
    public preSaleFilmOrder: IFilmOrder[];
    public isPreSaleSchedules: boolean;
    private preSaleSchedules: factory.chevre.event.screeningEvent.IEvent[];
    public reservationModal: boolean;
    public swiperConfig: SwiperConfigInterface;
    public ScheduleType: typeof ScheduleType = ScheduleType;

    @ViewChild(SwiperComponent) public componentRef: SwiperComponent;
    @ViewChild(SwiperDirective) public directiveRef: SwiperDirective;

    constructor(
        private error: ErrorService,
        private purchase: PurchaseService,
        private cinerino: CinerinoService,
        private router: Router
    ) {
        this.showTheaterList = true;
        this.theaters = [];
        this.dateList = [];
        this.preSaleDateList = [];
        this.preSaleFilmOrder = [];
        this.filmOrder = [];
        this.conditions = {
            theater: '',
            date: ''
        };
    }

    /**
     * 初期化
     * @method ngOnInit
     * @returns {Promise<void>}
     */
    public async ngOnInit(): Promise<void> {
        if (environment.ENV !== 'local') {
            location.href = environment.PORTAL_SITE_URL;
            return;
        }
        window.scrollTo(0, 0);
        moment.locale('ja');
        this.isLoading = true;
        this.isPreSaleSchedules = false;
        this.reservationModal = false;
        this.swiperConfig = {
            spaceBetween: 2,
            slidesPerView: 7,
            breakpoints: {
                320: { slidesPerView: 2 },
                767: { slidesPerView: 3 },
                1024: { slidesPerView: 7 }
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            }
        };
        try {
            await this.cinerino.getServices();
            this.theaters = (await this.cinerino.place.searchMovieTheaters({})).data;
            const theater = this.theaters[0];
            const branchCode = theater.branchCode;
            const now = moment().toDate();
            const today = moment(moment().format('YYYY-MM-DD')).toDate();
            this.preSaleSchedules = <factory.chevre.event.screeningEvent.IEvent[]>(await this.cinerino.event.search({
                typeOf: factory.chevre.eventType.ScreeningEvent,
                eventStatuses: [factory.chevre.eventStatusType.EventScheduled],
                superEvent: { locationBranchCodes: [branchCode] },
                startFrom: moment(today).add(3, 'days').toDate(),
                offers: {
                    validFrom: now,
                    validThrough: now,
                    availableFrom: now,
                    availableThrough: now
                }
            })).data;
            this.preSaleDateList = this.getPreSaleDateList();
            if (this.preSaleDateList.length > 0) {
                this.changePreSaleDate(this.preSaleDateList[0].value);
            }
            this.dateList = this.getDateList(7);
            this.conditions = {
                theater: branchCode,
                date: this.dateList[0].value
            };

            this.directiveRef.update();
            await this.changeConditions();
        } catch (err) {
            this.error.redirect(err);
        }
        this.isLoading = false;
    }

    /**
     * resize
     */
    public resize() {
        this.directiveRef.update();
        this.directiveRef.setIndex(0, 0, false);
    }

    /**
     * @method getDateList
     * @param {number} loop
     * @returns {IDate[]}
     */
    public getDateList(loop: number): IDate[] {
        const results = [];
        for (let i = 0; i < loop; i++) {
            const date = moment().add(i, 'day');
            results.push({
                value: date.format('YYYYMMDD'),
                label: {
                    date: date.format('DD'),
                    month: date.format('MM'),
                    day: date.format('(dd)')
                }
            });
        }

        return results;
    }

    /**
     * @method getPreSaleDateList
     * @param {number} loop
     * @returns {IDate[]}
     */
    public getPreSaleDateList(): IDate[] {
        const results: IDate[] = [];
        this.preSaleSchedules.forEach((schedule) => {
            const date = moment(schedule.startDate);
            const data = {
                value: date.format('YYYYMMDD'),
                label: {
                    date: date.format('DD'),
                    month: date.format('MM'),
                    day: date.format('(dd)')
                }
            };
            const duplicate = results.find((d) => d.value === data.value);
            if (!duplicate) {
                results.push(data);
            }
        });

        return results;
    }

    /**
     * 日付変更
     * @method changeDate
     * @param { string } date
     * @returns {Promise<void>}
     */
    public async changeDate(date: string): Promise<void> {
        this.conditions.date = date;
        await this.changeConditions();
    }

    /**
     * 日付変更
     * @method changePreSaleDate
     * @param { string } date
     * @returns { void }
     */
    public changePreSaleDate(date: string): void {
        this.conditions.date = date;
        const schedules = this.preSaleSchedules.filter((s) => {
            return date === moment(s.startDate).format('YYYYMMDD');
        });
        this.preSaleFilmOrder = this.getEventFilmOrder(schedules);
    }

    /**
     * 条件変更
     * @method changeConditions
     * @returns {Promise<void>}
     */
    public async changeConditions(): Promise<void> {
        this.isLoading = true;
        this.filmOrder = [];
        try {
            await this.cinerino.getServices();
            const theater = this.theaters.find((t) => {
                return (t.branchCode === this.conditions.theater);
            });
            if (theater === undefined) {
                throw new Error('theater is not found');
            }
            const today = moment(moment().format('YYYY-MM-DD')).toDate();
            this.schedules = <factory.chevre.event.screeningEvent.IEvent[]>(await this.cinerino.event.search({
                typeOf: factory.chevre.eventType.ScreeningEvent,
                eventStatuses: [factory.chevre.eventStatusType.EventScheduled],
                superEvent: {
                    locationBranchCodes: [theater.branchCode]
                },
                startFrom: moment(this.conditions.date).toDate(),
                startThrough: moment(this.conditions.date).add(1, 'day').toDate(),
                offers: {
                    availableFrom: today,
                    availableThrough: today
                }
            })).data;
            this.filmOrder = this.getEventFilmOrder(this.schedules);
        } catch (err) {
            this.error.redirect(err);
        }
        this.isLoading = false;
    }

    /**
     * 作品別上映スケジュール取得
     * @function getScreeningEvents
     * @returns {IFilmOrder[]}
     */
    public getEventFilmOrder(schedules: factory.chevre.event.screeningEvent.IEvent[]): IFilmOrder[] {
        const results: IFilmOrder[] = [];
        schedules.forEach((screeningEvent) => {
            // 販売可能時間判定
            if (
                !this.purchase.isSales(screeningEvent) ||
                !this.purchase.isOnlineDisplay(screeningEvent)
            ) {
                return;
            }
            const film = results.find((event) => {
                return (event.id === screeningEvent.superEvent.id);
            });
            if (film === undefined) {
                results.push({
                    id: screeningEvent.superEvent.id,
                    films: [screeningEvent]
                });
            } else {
                film.films.push(screeningEvent);
            }
        });

        return results.sort((a, b) => {
            const workPerformedA = a.films[0].workPerformed;
            const workPerformedB = b.films[0].workPerformed;
            if (workPerformedA === undefined
                || workPerformedA.datePublished === undefined) {
                return 1;
            }
            if (workPerformedB === undefined
                || workPerformedB.datePublished === undefined) {
                return -1;
            }
            const unixA = moment(workPerformedA.datePublished).unix();
            const unixB = moment(workPerformedB.datePublished).unix();
            if (unixA > unixB) {
                return -1;
            }
            if (unixA < unixB) {
                return 1;
            }
            return 0;
        });
    }

    public changeScheduleType(type: ScheduleType) {
        this.isPreSaleSchedules = (type === ScheduleType.Pre);
        this.conditions.date = (type === ScheduleType.Pre)
            ? this.preSaleDateList[0].value
            : this.dateList[0].value;
        if (type === ScheduleType.Pre) {
            console.log(type, this.conditions.date);
            this.changePreSaleDate(this.conditions.date);
        } else {
            console.log(type, this.conditions.date);
            this.changeDate(this.conditions.date);
        }
    }

    /**
     * @method selectSchedule
     */
    public async selectSchedule(data: factory.chevre.event.screeningEvent.IEvent) {
        this.isLoading = true;
        const findResult =
            this.theaters.find(t => t.branchCode === this.conditions.theater);
        if (findResult === undefined) {
            this.isLoading = false;
            return;
        }
        if (moment(data.startDate).add(-20, 'minutes').unix() < moment().unix()) {
            // 上映開始20分前以降ならエラー
            this.reservationModal = true;
            this.isLoading = false;
            return;
        }
        try {
            const id = data.id;
            const screeningEvent = await this.cinerino.event.findById({ id });
            if (screeningEvent.offers === undefined
                || screeningEvent.offers.seller === undefined
                || screeningEvent.offers.seller.id === undefined) {
                throw new Error('screeningEvent.offers.seller.id undefined');
            }
            const seller = await this.cinerino.seller.findById({ id: screeningEvent.offers.seller.id });
            const passport = await this.cinerino.getPassport(seller);
            this.router.navigate([`/purchase/transaction/${id}/${passport.token}`]);
            this.isLoading = false;
        } catch (error) {
            if (error.status === TOO_MANY_REQUESTS) {
                this.router.navigate(['/congestion']);
                return;
            }
            if (error.status === SERVICE_UNAVAILABLE) {
                this.router.navigate(['/maintenance']);
                return;
            }
            this.router.navigate(['/error']);
        }
    }

}
