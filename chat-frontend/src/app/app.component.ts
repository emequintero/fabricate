import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from './models/user';
import { ChatService } from './services/chat.service';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit, OnDestroy{
  title = 'chat-frontend';
  showSidebar:boolean;
  showHeader:boolean;
  user:User;
  curUserSub = new Subscription();
  routerEventsSub = new Subscription();
  constructor(private chatService: ChatService, private userService: UserService, public router:Router, 
    private activatedRoute:ActivatedRoute){}
  ngOnDestroy(): void {
    this.curUserSub.unsubscribe();
    this.routerEventsSub.unsubscribe();
  }
  public ngOnInit(): void {
    this.curUserSub = this.userService.getUser().subscribe((curUser:User)=>{
      this.user = curUser;
      if(!this.user){
        this.router.navigate(['login']);
      }
    });
    this.chatService.watchConnectionErrors();
    //leave showing sidebar to the router
    this.routerEventsSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showSidebar = this.activatedRoute.firstChild.snapshot.data.showSidebar !== false;
        this.showHeader = this.activatedRoute.firstChild.snapshot.data.showHeader !== false;
        document.body.style.paddingTop = this.showHeader ? '80px' : '0';
      }
    });
  }
}
