import { TestBed, inject } from '@angular/core/testing';

import { TestGuardService } from './test-guard.service';

describe('TestGuardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TestGuardService]
    });
  });

  it('should be created', inject([TestGuardService], (service: TestGuardService) => {
    expect(service).toBeTruthy();
  }));
});
