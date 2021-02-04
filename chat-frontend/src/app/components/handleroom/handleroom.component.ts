import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Room } from 'src/app/models/room';
import { User } from 'src/app/models/user';
import { ChatService } from 'src/app/services/chat.service';
import { RoomService } from 'src/app/services/room.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-handleroom',
  templateUrl: './handleroom.component.html',
  styleUrls: ['./handleroom.component.sass']
})
export class HandleroomComponent implements OnInit {
  availableUsers:Array<User> = null;
  selectedUsers:Array<User> = new Array<User>();
  curUser:User = null;
  roomsCurUser:Array<Room> = new Array<Room>();
  selectedRoom:Room = null;
  mode:string;
  constructor(private chatService:ChatService, private roomService:RoomService, 
    private userService:UserService, private router:Router, private route:ActivatedRoute) { }

  ngOnInit(): void {
    //get handle room mode (create/add)
    this.mode = this.route.snapshot.paramMap.get('mode');
    
    this.userService.getUser().subscribe((user)=>{
      this.curUser = user;
    });
    this.roomService.getRoomsCurUser().subscribe((roomsCurUser:Array<Room>)=>{
      this.roomsCurUser = roomsCurUser;
    });
    //get online users
    this.chatService.getAvailableUsers().subscribe(users=>{
      //handle room mode='add' will subscribe to selectedRoom
      if(this.mode === 'add'){
        this.roomService.getRoom().subscribe((selectedRoom:Room)=>{
          this.selectedRoom = selectedRoom;
          //handle room mode='add' will filter out availableUsers that are already in room
          let formattedUsers = users.map(user=>{
            return new User(user.profilePic, user.username, user.userID, user.role);
          });
          this.availableUsers = formattedUsers.filter((user:User)=>{
            return !this.selectedRoom.users.some((existingUser:User)=>{
              return existingUser.userID === user.userID;
            });
          });
        });
      }
      else if(this.mode === 'create'){
        this.availableUsers = users.map(user=>{
          return new User(user.profilePic, user.username, user.userID, user.role);
        });
      }
    });
    this.chatService.watchCurUserRooms().subscribe((roomsCurUser:Array<Room>)=>{
      //update rooms for current user in shareable resource
      let updatedRoomsCurUser = roomsCurUser.map(room=>{
        return new Room(room.users, room.messages, room.roomID);
      });
      //update roomsCurUser in shareable resource
      this.roomService.setRoomsCurUser(updatedRoomsCurUser);
    });
  }

  enterRoom(){
    //add selected user and current user to room
    this.selectedUsers.push(this.curUser);
    //pre-check if room already exists (avoids duplicates if user combination exists)
    let existingRoom = this.roomsCurUser.find((room:Room)=>{
      console.log(room.users.sort(this.compareUsers), this.selectedUsers.sort(this.compareUsers))
      return JSON.stringify(room.users.sort(this.compareUsers)) === JSON.stringify(this.selectedUsers.sort(this.compareUsers));
    });
    console.log(existingRoom);
    let newRoom = existingRoom ? new Room(existingRoom.users,existingRoom.messages,existingRoom.roomID) : new Room(this.selectedUsers);
    //enter room
    this.chatService.enterRoom(this.curUser, newRoom).subscribe((updatedSelectedRoom:Room)=>{
      //check if room already exists (users denying request can alter rooms)
      let roomAlreadyExists = this.roomsCurUser.find((room:Room)=>{
        return updatedSelectedRoom.roomID === room.roomID;
      });
      //update current room with returned room ID (generated by backend)
      newRoom = new Room(updatedSelectedRoom.users, updatedSelectedRoom.messages, updatedSelectedRoom.roomID);
      //update room in shareable resource
      this.roomService.setRoom(newRoom);
      //redirect to chat room
      this.router.navigateByUrl('main');
      //only send requests if room doesn't already exist
      if(!roomAlreadyExists){
        //send requests to other users added to room (not curUser)
        this.selectedUsers.forEach((user:User)=>{
          if(user.userID !== this.curUser.userID){
            this.chatService.sendRequest(this.curUser, user, newRoom);
          }
        });
      }
    });
  }

  addRoomUsers(){
    //send requests to other users added to room (not curUser)
    this.selectedUsers.forEach((user:User)=>{
      if(user.userID !== this.curUser.userID){
        this.chatService.sendRequest(this.curUser, user, this.selectedRoom);
      }
    });
    //redirect to chat room
    this.router.navigateByUrl('main');
  }

  submit(){
    if(this.mode === 'create'){
      this.enterRoom();
    }
    else if(this.mode === 'add'){
      this.addRoomUsers();
    }
  }

  handleUser(user:User, op:string){
    if(op === 'add'){
      this.selectedUsers.push(user);
    }
    else if(op === 'remove'){
      this.selectedUsers.splice(this.selectedUsers.indexOf(user), 1);
    }
  }

  isUserSelected(user:User){
    return this.selectedUsers.indexOf(user) !== -1;
  }

  //sort user array by username
  compareUsers = (a,b) =>{
    return a.username.localeCompare(b.username);
  }

}
