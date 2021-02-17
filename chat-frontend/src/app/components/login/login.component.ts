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
      src: '../../../assets/cat.png',
      description: 'cat looking at camera'
    },
    {
      src: '../../../assets/dog.png',
      description: 'dog looking at camera'
    },
    {
      src: '../../../assets/owl.png',
      description: 'sloth looking at camera'
    },
    {
      src: '../../../assets/panda-bear.png',
      description: 'panda bear looking at camera'
    },
    {
      src: '../../../assets/guinea-pig.png',
      description: 'guinea pig looking at camera'
    },
    {
      src: '../../../assets/koala.png',
      description: 'koala looking at camera'
    },
    {
      src: '../../../assets/bear.png',
      description: 'bear looking at camera'
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
    this.router.navigate(['home']);
  }

}
