import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeModel } from './three-model';

describe('ThreeModel', () => {
  let component: ThreeModel;
  let fixture: ComponentFixture<ThreeModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreeModel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreeModel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
