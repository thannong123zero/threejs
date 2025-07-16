import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeTextComponent } from './three-text.component';

describe('ThreeTextComponent', () => {
  let component: ThreeTextComponent;
  let fixture: ComponentFixture<ThreeTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreeTextComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreeTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
