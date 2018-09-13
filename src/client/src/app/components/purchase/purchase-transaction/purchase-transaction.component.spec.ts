import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseTransactionComponent } from './purchase-transaction.component';

describe('PurchaseTransactionComponent', () => {
  let component: PurchaseTransactionComponent;
  let fixture: ComponentFixture<PurchaseTransactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseTransactionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
