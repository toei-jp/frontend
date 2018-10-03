import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthSigninComponent } from './components/auth/auth-signin/auth-signin.component';
import { BaseComponent } from './components/base/base.component';
import { ErrorComponent } from './components/error/error.component';
import { ExpiredComponent } from './components/expired/expired.component';
import { InquiryConfirmComponent } from './components/inquiry/inquiry-confirm/inquiry-confirm.component';
import { InquiryLoginComponent } from './components/inquiry/inquiry-login/inquiry-login.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { PurchaseBaseComponent } from './components/purchase/purchase-base/purchase-base.component';
import { PurchaseCompleteComponent } from './components/purchase/purchase-complete/purchase-complete.component';
import { PurchaseConfirmComponent } from './components/purchase/purchase-confirm/purchase-confirm.component';
import { PurchaseInputComponent } from './components/purchase/purchase-input/purchase-input.component';
import { PurchaseMvtkConfirmComponent } from './components/purchase/purchase-mvtk-confirm/purchase-mvtk-confirm.component';
import { PurchaseMvtkInputComponent } from './components/purchase/purchase-mvtk-input/purchase-mvtk-input.component';
import { PurchaseOverlapComponent } from './components/purchase/purchase-overlap/purchase-overlap.component';
// import { PurchasePointComponent } from './components/purchase/purchase-point/purchase-point.component';
import { PurchaseScheduleComponent } from './components/purchase/purchase-schedule/purchase-schedule.component';
import { PurchaseSeatComponent } from './components/purchase/purchase-seat/purchase-seat.component';
import { PurchaseTicketComponent } from './components/purchase/purchase-ticket/purchase-ticket.component';
import { PurchaseTransactionComponent } from './components/purchase/purchase-transaction/purchase-transaction.component';
import { TestScreenComponent } from './components/test/test-screen/test-screen.component';
// import { MemberGuardService } from './services/member-guard/member-guard.service';
import { PurchaseGuardService } from './services/purchase-guard/purchase-guard.service';
import { TestGuardService } from './services/test-guard/test-guard.service';

const routes: Routes = [
    { path: '', redirectTo: 'purchase/transaction', pathMatch: 'full' },
    { path: 'purchase/transaction', component: PurchaseTransactionComponent },
    { path: 'auth/signin', component: AuthSigninComponent },
    {
        path: '',
        component: BaseComponent,
        children: [
            { path: 'purchase/schedule', component: PurchaseScheduleComponent },
            { path: 'purchase/overlap', component: PurchaseOverlapComponent },
            { path: 'inquiry/login/:theater', component: InquiryLoginComponent },
            { path: 'inquiry/confirm', component: InquiryConfirmComponent }
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
