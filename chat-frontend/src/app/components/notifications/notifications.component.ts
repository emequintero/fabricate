import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.sass']
})
export class NotificationsComponent implements OnInit {
  curUser:User = null;
  constructor(private userService:UserService) { }

  ngOnInit(): void {
    this.userService.getUser().subscribe((user)=>{
      this.curUser = user;
    });
  }

}
