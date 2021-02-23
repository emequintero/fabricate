import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ChatroomModule } from '../chatroom/chatroom.module';
import { HandleroomModule } from '../handleroom/handleroom.module';
import { HomeModule } from '../home/home.module';
import { LoginModule } from '../login/login.module';
import { NotificationsModule } from '../notifications/notifications.module';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full'},
    {
      path: 'login',
      loadChildren: () => LoginModule,
      data: {showSidebar: false}
    },
    {
      path: 'home',
      loadChildren: () => HomeModule
    },
    {
      path: 'handle-room/:mode',
      loadChildren: () => HandleroomModule
    },
    {
      path: 'chat-room',
      loadChildren: () => ChatroomModule
    },
    {
      path: 'notifications',
      loadChildren: () => NotificationsModule
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeaderComponent ],
      imports: [
        RouterTestingModule.withRoutes(routes)
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
