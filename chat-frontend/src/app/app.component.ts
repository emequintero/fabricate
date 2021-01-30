import { Component, HostListener } from '@angular/core';
import { ChatService } from './services/chat.service';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent{
  title = 'chat-frontend';
  constructor(private chatService: ChatService, private userService: UserService){}
  //leave chat on window close
  @HostListener('window:beforeunload', ['$event'])
  beforeunloadHandler(event) {
    let user = this.userService.getUser().value;
    this.chatService.leave(user);
  }
}
