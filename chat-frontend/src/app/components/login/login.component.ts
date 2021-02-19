import { Component, OnDestroy, OnInit } from '@angular/core';
import { Event, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/user';
import { ChatService } from 'src/app/services/chat.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent implements OnInit, OnDestroy{

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
      src: '../../../assets/bear.png',
      description: 'bear looking at camera'
    }
  ];

  username:string = "";
  selectedProfilePic = null;
  isUsernameUnavailable:boolean = true;
  availableUsersSub:Subscription = new Subscription();
  unavailableUsernames:Array<string> = new Array<string>();

  constructor(private userService:UserService, private router:Router, private chatService:ChatService) { }

  ngOnDestroy(): void{
    this.availableUsersSub.unsubscribe();
  }

  ngOnInit(): void {
    this.availableUsersSub = this.chatService.getAvailableUsers().subscribe((users:Array<User>)=>{
      this.unavailableUsernames = users.map((user:User)=>{
        return user.username;
      });
    });
  }

  setProfilePic(image):void{
    this.selectedProfilePic = image;
  }

  checkAvailability(){
    setTimeout(()=>{
      //check if username is available
      this.isUsernameUnavailable = this.unavailableUsernames.indexOf(this.username) !== -1;
    }, 0)
  }

  submitUser():void{
    let curUser = new User(this.selectedProfilePic, this.username);
    this.userService.setUser(curUser);
    //redirect to home
    this.router.navigate(['home']);
  }

}
