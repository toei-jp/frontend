import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseMvtkInputComponent } from './purchase-mvtk-input.component';

describe('PurchaseMvtkInputComponent', () => {
  let component: PurchaseMvtkInputComponent;
  let fixture: ComponentFixture<PurchaseMvtkInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseMvtkInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseMvtkInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
