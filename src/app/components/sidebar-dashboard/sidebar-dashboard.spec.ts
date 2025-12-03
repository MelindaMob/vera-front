import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarDashboard } from './sidebar-dashboard';

describe('SidebarDashboard', () => {
  let component: SidebarDashboard;
  let fixture: ComponentFixture<SidebarDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
