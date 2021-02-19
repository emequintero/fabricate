import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SidebarComponent ],
      imports: [
        RouterTestingModule.withRoutes([])
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to handle-room page with create mode when clicking create room button', ()=>{
    let navigationSpy = spyOn(component.router, 'navigate');
    component.createRoom();
    expect(navigationSpy).toHaveBeenCalledWith(['handle-room', 'create']);
  });

  it('should navigate to notifications page when clicking notifications button', ()=>{
    let navigationSpy = spyOn(component.router, 'navigate');
    component.showNotifications();
    expect(navigationSpy).toHaveBeenCalledWith(['notifications']);
  });

  it('should navigate to home page when clicking home button', ()=>{
    let navigationSpy = spyOn(component.router, 'navigate');
    component.sendHome();
    expect(navigationSpy).toHaveBeenCalledWith(['home']);
  });
});
