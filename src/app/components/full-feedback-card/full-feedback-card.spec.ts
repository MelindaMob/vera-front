import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullFeedbackCard } from './full-feedback-card';

describe('FullFeedbackCard', () => {
  let component: FullFeedbackCard;
  let fixture: ComponentFixture<FullFeedbackCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FullFeedbackCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FullFeedbackCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
