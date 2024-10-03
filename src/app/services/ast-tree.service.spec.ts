import { TestBed } from '@angular/core/testing';

import { AstTreeService } from './ast-tree.service';

describe('AstTreeService', () => {
  let service: AstTreeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AstTreeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
