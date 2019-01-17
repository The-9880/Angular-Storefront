import { TestBed } from '@angular/core/testing';

import { LoginSessionService } from './login-session.service';

describe('LoginSessionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LoginSessionService = TestBed.get(LoginSessionService);
    expect(service).toBeTruthy();
  });
});
