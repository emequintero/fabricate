import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatroomComponent } from './components/chatroom/chatroom.component';
import { HandleroomComponent } from './components/handleroom/handleroom.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { MainComponent } from './components/main/main.component';
import { NotificationsComponent } from './components/notifications/notifications.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full'},
  { path: 'main', component:  MainComponent, 
  children: [
    {path: '', component: HomeComponent},
    {path: 'chat-room', component: ChatroomComponent},
    {path: 'handle-room/:mode', component: HandleroomComponent},
    {path: 'notifications', component: NotificationsComponent}
  ]},
  { path: 'login', component:  LoginComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }