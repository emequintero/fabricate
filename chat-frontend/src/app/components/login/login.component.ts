import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent implements OnInit {
  username:string = "";

  images:Array<object> = [
    {
      src: '../../../assets/cat.jpg',
      description: 'cat looking at camera'
    },
    {
      src: '../../../assets/dog.jpg',
      description: 'dog looking at camera'
    },
    {
      src: '../../../assets/sloth.png',
      description: 'sloth looking at camera'
    }
  ];

  selectedProfilePic = null;

  constructor(private userService:UserService, private router:Router) { }

  ngOnInit(): void {
  }

  setProfilePic(image):void{
    this.selectedProfilePic = image;
  }

  submitUser():void{
    let curUser = new User(this.selectedProfilePic,this.username);
    this.userService.setUser(curUser);
    //redirect to home
    this.router.navigate(['main']);
  }

}
