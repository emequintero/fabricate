import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ChatService } from './services/chat.service';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit{
  title = 'chat-frontend';
  showSidebar:boolean = false;
  constructor(private chatService: ChatService, private userService: UserService, private router:Router, 
    private activatedRoute:ActivatedRoute){}
  ngOnInit(): void {
    //leave showing sidebar to the router
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showSidebar = this.activatedRoute.firstChild.snapshot.data.showSidebar !== false;
      }
    });
  }
  //leave chat on window close
  @HostListener('window:beforeunload', ['$event'])
  beforeunloadHandler(event) {
    let user = this.userService.getUser().value;
    this.chatService.leaveApp(user);
  }
}
