import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseConfirmComponent } from './purchase-confirm.component';

describe('PurchaseConfirmComponent', () => {
  let component: PurchaseConfirmComponent;
  let fixture: ComponentFixture<PurchaseConfirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
