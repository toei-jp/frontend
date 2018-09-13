import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseMvtkConfirmComponent } from './purchase-mvtk-confirm.component';

describe('PurchaseMvtkConfirmComponent', () => {
  let component: PurchaseMvtkConfirmComponent;
  let fixture: ComponentFixture<PurchaseMvtkConfirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseMvtkConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseMvtkConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
