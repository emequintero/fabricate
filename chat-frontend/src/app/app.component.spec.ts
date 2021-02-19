import { TestBed } from '@angular/core/testing';
import { Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { ChatroomModule } from './components/chatroom/chatroom.module';
import { HandleroomModule } from './components/handleroom/handleroom.module';
import { HeaderComponent } from './components/header/header.component';
import { HomeModule } from './components/home/home.module';
import { LoginModule } from './components/login/login.module';
import { NotificationsModule } from './components/notifications/notifications.module';
import { SidebarComponent } from './components/sidebar/sidebar.component';

describe('AppComponent', () => {
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
      declarations: [
        AppComponent,
        HeaderComponent,
        SidebarComponent
      ],
      imports: [
        RouterTestingModule.withRoutes(routes)
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'chat-frontend'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('chat-frontend');
  });
});
