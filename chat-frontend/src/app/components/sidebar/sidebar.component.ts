import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Room } from 'src/app/models/room';
import { User } from 'src/app/models/user';
import { ChatService } from 'src/app/services/chat.service';
import { RoomService } from 'src/app/services/room.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.sass']
})
export class SidebarComponent implements OnInit {
  sideBarHidden = true;
  curUser:User = null;
  selectedRoom:Room = null;
  roomsCurUser:Array<Room> = new Array<Room>();
  constructor(private chatService:ChatService, private userService:UserService, 
    private roomService:RoomService, private router:Router) { }

  ngOnInit(): void {
    //join chat
    this.curUser = this.userService.getUser().value;
    this.chatService.join(this.curUser).subscribe(curUser=>{
      this.curUser = new User(curUser.profilePic, curUser.username, curUser.userID);
      this.userService.setUser(this.curUser);
    });
  }

  toggleSideBar(){
    this.sideBarHidden = !this.sideBarHidden;
  }

  createRoom(){
    //close sidebar
    this.toggleSideBar();
    //open create room child-view
    this.router.navigateByUrl('main/create-room');
  }

  enterRoom(user){
    //check if room hasn't been entered
    if(this.roomsCurUser.indexOf(this.selectedRoom) === -1){
      //add selected user and current user to room
      this.selectedRoom = new Room([user, this.curUser]);
    }
    //close sidebar
    this.toggleSideBar();
    //enter room
    this.chatService.enterRoom(this.curUser, this.selectedRoom).subscribe((roomData:any)=>{
      //update current room
      this.selectedRoom = new Room(roomData.selectedRoom.users, roomData.selectedRoom.messages, roomData.selectedRoom.roomID);
      //update available rooms
      this.roomsCurUser = roomData.roomsCurUser;
      //update room in shareable resource
      this.roomService.setRoom(this.selectedRoom);
    });
  }

  isRoomSelected(user){
    if(this.selectedRoom){
      //TODO: make work for group chats
      let otherUserFound = this.selectedRoom.users.find(roomUser=>{return user.username === roomUser.username});
      let curUserFound = this.selectedRoom.users.find(roomUser=>{return roomUser.username === this.curUser.username});
      return otherUserFound !== undefined && curUserFound !== undefined;
    }
    else{
      return false;
    }
  }

}
