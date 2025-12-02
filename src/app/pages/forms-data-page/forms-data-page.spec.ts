import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsDataPage } from './forms-data-page';

describe('FormsDataPage', () => {
  let component: FormsDataPage;
  let fixture: ComponentFixture<FormsDataPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsDataPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormsDataPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
