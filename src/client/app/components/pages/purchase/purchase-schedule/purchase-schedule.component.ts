import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { factory } from '@cinerino/api-javascript-client';
import { SERVICE_UNAVAILABLE, TOO_MANY_REQUESTS } from 'http-status';
import * as moment from 'moment';
import { SwiperComponent, SwiperConfigInterface, SwiperDirective } from 'ngx-swiper-wrapper';
import { environment } from '../../../../../environments/environment';
import { CinerinoService, ErrorService, PurchaseService, SaveType, StorageService } from '../../../../services';

type IMovieTheater = factory.organization.movieTheater.IOrganization;
type IScreeningEvent = factory.chevre.event.screeningEvent.IEvent;
interface IFilmOrder {
    id: string;
    films: IScreeningEvent[];
}

interface IDate {
    value: string;
    label: {
        date: string,
        month: string,
        day: string
    };
}

@Component({
    selector: 'app-purchase-schedule',
    templateUrl: './purchase-schedule.component.html',
    styleUrls: ['./purchase-schedule.component.scss']
})
export class PurchaseScheduleComponent implements OnInit {
    public moment: typeof moment = moment;
    public theaters: IMovieTheater[];
    public isLoading: boolean;
    public showTheaterList: boolean;
    public dateList: IDate[];
    public filmOrder: IFilmOrder[];
    public schedules: IScreeningEvent[];
    public conditions: { theater: string; date: string };
    public environment = environment;
    public preSaleDateList: IDate[];
    public preSaleFilmOrder: IFilmOrder[];
    public isPreSaleSchedules: boolean;
    private preSaleSchedules: IScreeningEvent[];
    public swiperConfig: SwiperConfigInterface;
    @ViewChild(SwiperComponent) public componentRef: SwiperComponent;
    @ViewChild(SwiperDirective) public directiveRef: SwiperDirective;

    constructor(
        private error: ErrorService,
        private route: ActivatedRoute,
        private purchase: PurchaseService,
        private cinerino: CinerinoService,
        private storage: StorageService,
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
        window.scrollTo(0, 0);
        moment.locale('ja');
        this.isLoading = true;
        this.isPreSaleSchedules = false;
        this.swiperConfig = {
            spaceBetween: 10,
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
            const theaterQs = this.route.snapshot.queryParamMap.get('theater');
            this.theaters = (await this.cinerino.organization.searchMovieTheaters({})).data;
            if (theaterQs !== null) {
                const theater = this.theaters.find((t) => (
                    t.name.en.toLocaleLowerCase().indexOf(theaterQs.toLocaleLowerCase()) >= 0
                ));
                if (theater !== undefined) {
                    this.theaters = [theater];
                    this.showTheaterList = false;
                }
            }

            const now = moment().toDate();
            const today = moment(moment().format('YYYY-MM-DD')).toDate();
            this.preSaleSchedules = (await this.cinerino.event.searchScreeningEvents({
                eventStatuses: [factory.chevre.eventStatusType.EventScheduled],
                superEvent: {
                    locationBranchCodes: [this.theaters[0].location.branchCode]
                },
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
                theater: this.theaters[0].location.branchCode,
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
            const theater = this.theaters.find((target) => {
                return (target.location.branchCode === this.conditions.theater);
            });
            if (theater === undefined) {
                throw new Error('theater is not found');
            }
            const now = moment(this.conditions.date).toDate();
            this.schedules = (await this.cinerino.event.searchScreeningEvents({
                eventStatuses: [factory.chevre.eventStatusType.EventScheduled],
                superEvent: {
                    locationBranchCodes: [theater.location.branchCode]
                },
                startFrom: moment(this.conditions.date).toDate(),
                startThrough: moment(this.conditions.date).add(1, 'day').toDate(),
                offers: {
                    availableFrom: now,
                    availableThrough: now
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
    public getEventFilmOrder(schedules: IScreeningEvent[]): IFilmOrder[] {
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
                return (event.id === screeningEvent.workPerformed.identifier);
            });
            if (film === undefined) {
                results.push({
                    id: screeningEvent.workPerformed.identifier,
                    films: [screeningEvent]
                });
            } else {
                film.films.push(screeningEvent);
            }
        });

        return results.sort((event1, event2) => {
            if (event1.films[0].name.ja < event2.films[0].name.ja) {
                return -1;
            }
            if (event1.films[0].name.ja > event2.films[0].name.ja) {
                return 1;
            }
            return 0;
        });
    }

    public changeScheduleType(type: 'pre' | 'normal') {
        this.isPreSaleSchedules = (type === 'pre');
        this.conditions.date = (type === 'pre') ? this.preSaleDateList[0].value : this.dateList[0].value;
    }

    /**
     * @method selectSchedule
     */
    public async selectSchedule(data: factory.chevre.event.screeningEvent.IEvent) {
        this.isLoading = true;
        const findResult =
            this.theaters.find(theater => theater.location.branchCode === this.conditions.theater);
        if (findResult === undefined) {
            this.isLoading = false;
            return;
        }
        try {
            const selleId = findResult.id;
            const passport = await this.purchase.getPassport(selleId);
            this.storage.save('parameters', {
                passportToken: passport.token,
                signInRedirect: false,
                performanceId: data.id
            }, SaveType.Session);
            this.router.navigate(['/purchase/transaction']);
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
