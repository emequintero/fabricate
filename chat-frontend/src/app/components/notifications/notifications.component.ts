import { Component, OnInit } from '@angular/core';
import { Request } from 'src/app/models/request';
import { Room } from 'src/app/models/room';
import { User } from 'src/app/models/user';
import { ChatService } from 'src/app/services/chat.service';
import { RoomService } from 'src/app/services/room.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.sass']
})
export class NotificationsComponent implements OnInit {
  curUser:User = null;
  constructor(private userService:UserService, private chatService:ChatService, private roomService:RoomService) { }

  ngOnInit(): void {
    this.userService.getUser().subscribe((user)=>{
      this.curUser = user;
    });
  }

  handleRequest(request:Request, operation:string){
    this.chatService.updateRequest(request, this.curUser, operation);
    //enter room if user accepts request
    if(operation === 'accepted'){
      console.log(request)
      this.enterRoom(request.room);
    }
  }

  enterRoom(selectedRoom:Room){
    this.chatService.enterRoom(this.curUser, selectedRoom).subscribe((roomData:any)=>{
      //update current room with returned room ID (generated by backend)
      let updatedRoom = new Room(roomData.selectedRoom.users, roomData.selectedRoom.messages, roomData.selectedRoom.roomID);
      //update room in shareable resource
      this.roomService.setRoom(updatedRoom);
      //update rooms for current user in shareable resource
      let roomsCurUser = roomData.roomsCurUser.map(room=>{
        return new Room(room.users, room.messages, room.roomID);
      });
      //update roomsCurUser in shareable resource
      this.roomService.setRoomsCurUser(roomsCurUser);
    });
  }

}