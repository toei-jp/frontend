import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BaseComponent } from './components/pages/base/base.component';
import { CompanyComponent } from './components/pages/company/company.component';
import { CongestionComponent } from './components/pages/congestion/congestion.component';
import { ErrorComponent } from './components/pages/error/error.component';
import { ExpiredComponent } from './components/pages/expired/expired.component';
import { LawComponent } from './components/pages/law/law.component';
import { MaintenanceComponent } from './components/pages/maintenance/maintenance.component';
import { NotFoundComponent } from './components/pages/not-found/not-found.component';
import { PurchaseBaseComponent } from './components/pages/purchase/purchase-base/purchase-base.component';
import { PurchaseCompleteComponent } from './components/pages/purchase/purchase-complete/purchase-complete.component';
import { PurchaseConfirmComponent } from './components/pages/purchase/purchase-confirm/purchase-confirm.component';
import { PurchaseInputComponent } from './components/pages/purchase/purchase-input/purchase-input.component';
import { PurchaseMvtkConfirmComponent } from './components/pages/purchase/purchase-mvtk-confirm/purchase-mvtk-confirm.component';
import { PurchaseMvtkInputComponent } from './components/pages/purchase/purchase-mvtk-input/purchase-mvtk-input.component';
import { PurchaseOverlapComponent } from './components/pages/purchase/purchase-overlap/purchase-overlap.component';
import { PurchaseScheduleComponent } from './components/pages/purchase/purchase-schedule/purchase-schedule.component';
import { PurchaseSeatComponent } from './components/pages/purchase/purchase-seat/purchase-seat.component';
import { PurchaseTicketComponent } from './components/pages/purchase/purchase-ticket/purchase-ticket.component';
import { PurchaseTransactionComponent } from './components/pages/purchase/purchase-transaction/purchase-transaction.component';
import { TestScreenComponent } from './components/pages/test/test-screen/test-screen.component';
import { TicketingMethodComponent } from './components/pages/ticketing-method/ticketing-method.component';
import { PurchaseGuardService } from './services/purchase-guard/purchase-guard.service';
import { TestGuardService } from './services/test-guard/test-guard.service';

const routes: Routes = [
    { path: '', redirectTo: 'purchase/transaction', pathMatch: 'full' },
    { path: 'purchase/transaction', component: PurchaseTransactionComponent },
    { path: 'purchase/transaction/:performanceId', component: PurchaseTransactionComponent },
    { path: 'purchase/transaction/:performanceId/:passportToken', component: PurchaseTransactionComponent },
    {
        path: '',
        component: BaseComponent,
        children: [
            { path: 'purchase/overlap/:performanceId', component: PurchaseOverlapComponent },
            { path: 'purchase/overlap/:performanceId/:passportToken', component: PurchaseOverlapComponent },
        ]
    },
    {
        path: 'purchase',
        component: PurchaseBaseComponent,
        children: [
            { path: 'schedule', component: PurchaseScheduleComponent },
        ]
    },
    {
        path: 'purchase',
        component: PurchaseBaseComponent,
        canActivate: [PurchaseGuardService],
        children: [
            { path: 'seat', component: PurchaseSeatComponent },
            { path: 'ticket', component: PurchaseTicketComponent },
            { path: 'input', component: PurchaseInputComponent },
            { path: 'confirm', component: PurchaseConfirmComponent },
            { path: 'mvtk/input', component: PurchaseMvtkInputComponent },
            { path: 'mvtk/confirm', component: PurchaseMvtkConfirmComponent },
            // { path: 'point', canActivate: [MemberGuardService], component: PurchasePointComponent }
        ]
    },
    {
        path: 'purchase',
        component: PurchaseBaseComponent,
        children: [
            { path: 'complete', component: PurchaseCompleteComponent }
        ]
    },
    {
        path: 'test',
        canActivate: [TestGuardService],
        children: [
            { path: ':theaterCode/:screenCode/screen', component: TestScreenComponent }
        ]
    },
    {
        path: '',
        component: BaseComponent,
        children: [
            { path: 'law', component: LawComponent },
            { path: 'company', component: CompanyComponent },
            { path: 'ticketing-method', component: TicketingMethodComponent },
            { path: 'congestion', component: CongestionComponent },
            { path: 'maintenance', component: MaintenanceComponent },
            { path: 'error', component: ErrorComponent },
            { path: 'expired', component: ExpiredComponent },
            { path: '**', component: NotFoundComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true, enableTracing: true })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
