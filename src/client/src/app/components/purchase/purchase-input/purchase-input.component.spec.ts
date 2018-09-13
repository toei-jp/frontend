import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseInputComponent } from './purchase-input.component';

describe('PurchaseInputComponent', () => {
  let component: PurchaseInputComponent;
  let fixture: ComponentFixture<PurchaseInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
