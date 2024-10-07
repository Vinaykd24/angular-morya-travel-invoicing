import { TestBed } from '@angular/core/testing';

import { VehicleFacadeService } from './vehicle-facade.service';

describe('VehicleFacadeService', () => {
  let service: VehicleFacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VehicleFacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
