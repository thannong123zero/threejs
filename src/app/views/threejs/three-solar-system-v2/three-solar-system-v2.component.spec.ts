import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeSolarSystemV2Component } from './three-solar-system-v2.component';

describe('ThreeSolarSystemV2Component', () => {
  let component: ThreeSolarSystemV2Component;
  let fixture: ComponentFixture<ThreeSolarSystemV2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreeSolarSystemV2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreeSolarSystemV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
