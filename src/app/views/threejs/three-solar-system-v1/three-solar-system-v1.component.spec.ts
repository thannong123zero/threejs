import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeSolarSystemV1Component } from './three-solar-system-v1.component';

describe('ThreeSolarSystemV1Component', () => {
  let component: ThreeSolarSystemV1Component;
  let fixture: ComponentFixture<ThreeSolarSystemV1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreeSolarSystemV1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreeSolarSystemV1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
