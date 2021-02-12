import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatroomModule } from './components/chatroom/chatroom.module';
import { HandleroomModule } from './components/handleroom/handleroom.module';
import { HomeModule } from './components/home/home.module';
import { LoginModule } from './components/login/login.module';
import { NotificationsModule } from './components/notifications/notifications.module';

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

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }