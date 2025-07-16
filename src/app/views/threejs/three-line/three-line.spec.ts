import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeLine } from './three-line';

describe('ThreeLine', () => {
  let component: ThreeLine;
  let fixture: ComponentFixture<ThreeLine>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreeLine]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreeLine);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
