import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeHero3dComponent } from './three-hero3d.component';

describe('ThreeHero3dComponent', () => {
  let component: ThreeHero3dComponent;
  let fixture: ComponentFixture<ThreeHero3dComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreeHero3dComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreeHero3dComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
