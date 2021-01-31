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
  roomsCurUser:Array<Room> = null;
  formattedRoomsCurUser:Array<any> = null;
  constructor(private chatService:ChatService, private userService:UserService, 
    private roomService:RoomService, private router:Router) { }

  ngOnInit(): void {
    //join chat
    this.curUser = this.userService.getUser().value;
    this.chatService.join(this.curUser).subscribe(curUser=>{
      this.curUser = new User(curUser.profilePic, curUser.username, curUser.userID);
      this.userService.setUser(this.curUser);
    });
    //watch changes/update rooms for current user
    this.roomService.getRoomsCurUser().subscribe(roomsCurUser=>{
      this.roomsCurUser = roomsCurUser;
      if(this.roomsCurUser){
        this.formattedRoomsCurUser = this.formatRooms(this.roomsCurUser);
      }
    });
    //watch changes for selected room
    this.roomService.getRoom().subscribe(selectedRoom=>{
      this.selectedRoom = selectedRoom;
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

  enterRoom(roomToSwitchTo){
    //close sidebar
    this.toggleSideBar();
    //enter room
    this.chatService.enterRoom(this.curUser, roomToSwitchTo).subscribe((roomData:any)=>{
      //update current room
      let selectedRoom = new Room(roomData.selectedRoom.users, roomData.selectedRoom.messages, roomData.selectedRoom.roomID);
      //update room in shareable resource
      this.roomService.setRoom(selectedRoom);
      //update available rooms
      let roomsCurUser = roomData.roomsCurUser.map(room=>{
        return new Room(room.users, room.messages, room.roomID);
      });
      //update roomsCurUser in shareable resource
      this.roomService.setRoomsCurUser(roomsCurUser);
    });
  }

  isRoomSelected(users:Array<User>){
    if(this.selectedRoom){
      return JSON.stringify(this.selectedRoom.users.sort(this.compareUsers)) === JSON.stringify(users.sort(this.compareUsers));
    }
    else{
      return false;
    }
  }

  formatRooms(rooms:Array<any>){
    return rooms.map(room=>{
      room.headerUsers = room.users.filter((user:User)=>{
        return user.userID !== this.curUser.userID;
      });
      return room;
    })
  }

  //sort user array by username
  private compareUsers = (a,b) =>{
      return a.username.localeCompare(b.username);
  }

}
