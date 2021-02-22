import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { ChatService } from 'src/app/services/chat.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass']
})
export class HeaderComponent implements OnInit {
  user:User = null;
  constructor(private userService:UserService, private chatService:ChatService, private router:Router) { }

  public ngOnInit(): void {
    this.userService.getUser().subscribe(user=>{
      this.user = user;
    });
  }

  logout():void{
    this.chatService.leaveApp(this.user);
    this.router.navigate(['login']);
    this.userService.setUser(null);
    sessionStorage.clear();
  }

}
