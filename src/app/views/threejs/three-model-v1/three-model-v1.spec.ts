import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeModelV1 } from './three-model-v1';

describe('ThreeModelV1', () => {
  let component: ThreeModelV1;
  let fixture: ComponentFixture<ThreeModelV1>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreeModelV1]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreeModelV1);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
