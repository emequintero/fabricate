import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { User } from './models/user';
import { ChatService } from './services/chat.service';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit{
  title = 'chat-frontend';
  showSidebar:boolean;
  showHeader:boolean;
  user:User;
  constructor(private chatService: ChatService, private userService: UserService, public router:Router, 
    private activatedRoute:ActivatedRoute){}
  public ngOnInit(): void {
    this.userService.getUser().subscribe((curUser:User)=>{
      this.user = curUser;
      if(!this.user){
        this.router.navigate(['login']);
      }
    });
    //leave showing sidebar to the router
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showSidebar = this.activatedRoute.firstChild.snapshot.data.showSidebar !== false;
        this.showHeader = this.activatedRoute.firstChild.snapshot.data.showHeader !== false;
        document.body.style.paddingTop = this.showHeader ? '80px' : '0';
      }
    });
  }
  @HostListener('window:beforeunload', ['$event'])
  function() {
    this.chatService.leaveApp(this.user);
    this.router.navigate(['login']);
    this.userService.setUser(null);
  }
}
