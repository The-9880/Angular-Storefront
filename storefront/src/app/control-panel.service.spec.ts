import { TestBed } from '@angular/core/testing';

import { ControlPanelService } from './control-panel.service';

describe('ControlPanelService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ControlPanelService = TestBed.get(ControlPanelService);
    expect(service).toBeTruthy();
  });
});
