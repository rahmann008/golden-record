import { TestBed } from '@angular/core/testing';

import { UtillsService } from './utills.service';

describe('UtillsService', () => {
  let service: UtillsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UtillsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
