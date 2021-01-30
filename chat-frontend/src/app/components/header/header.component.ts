import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass']
})
export class HeaderComponent implements OnInit {
  user:User = null;
  constructor(private userService:UserService, private router:Router) { }

  ngOnInit(): void {
    if(!this.user){
      this.router.navigateByUrl('/login');
    }
    this.userService.getUser().subscribe(user=>{
      this.user = user;
    });
  }

}
