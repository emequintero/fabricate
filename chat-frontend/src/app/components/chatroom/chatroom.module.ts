import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatroomRoutingModule } from './chatroom-routing.module';
import { ChatroomComponent } from './chatroom.component';

@NgModule({
  imports: [
    CommonModule,
    ChatroomRoutingModule
  ],
  declarations: [ChatroomComponent]
})
export class ChatroomModule { }