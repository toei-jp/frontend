import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseBaseComponent } from './purchase-base.component';

describe('PurchaseBaseComponent', () => {
  let component: PurchaseBaseComponent;
  let fixture: ComponentFixture<PurchaseBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
