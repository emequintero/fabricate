import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from 'src/environments/environment';
import { Request } from '../models/request';
import { Room } from '../models/room';
import { User } from '../models/user';
import { UserService } from './user.service';
declare var io;

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket:any = null;
  //connect to express socket
  constructor(private userService:UserService) {
    this.socket = io(BASE_URL);
  }
  //join chat
  join(userData:User):Observable<User>{
    this.socket.emit('join', userData);
    return new Observable((curUserObserver)=>{
      this.socket.on('join', curUser=>{
        curUserObserver.next(curUser);
      });
    });
  }
  //get available users
  getAvailableUsers():Observable<Array<User>>{
    this.socket.emit('availableUsers');
    return new Observable((availableUsersObserver)=>{
      this.socket.on('availableUsers', users=>{
        var curUser = this.userService.getUser().value;
        let availableUsers = users.filter(user=>{
          return user.username !== curUser.username;
        });
        availableUsersObserver.next(availableUsers);
      })
    });
  }
  //enter room
  enterRoom(userEntering:User, room:Room){
    this.socket.emit('enterRoom', {
      userEntering: userEntering,
      selectedRoom: room
    });
    return new Observable((roomObserver)=>{
      this.socket.on('selectedRoom', selectedRoomData=>{
        roomObserver.next(selectedRoomData);
      })
    });
  }
  //leave room
  leaveRoom(userLeaving:User, selectedRoom:Room){
    this.socket.emit('leaveRoom', {
      userLeaving: userLeaving,
      selectedRoom: selectedRoom
    });
  }
  //watch users in room
  watchRoomUsers(){
    return new Observable((roomUsersObserver)=>{
      this.socket.on('updatedRoomUsers', roomUsersData=>{
        roomUsersObserver.next(roomUsersData);
      })
    });
  }
  //watch rooms for current user
  watchCurUserRooms(){
    return new Observable((curUserRoomsObserver)=>{
      this.socket.on('updatedCurUserRooms', curUserRoomsData=>{
        curUserRoomsObserver.next(curUserRoomsData);
      })
    });
  }
  //send message in current room
  sendMessage(room:Room){
    this.socket.emit('sendMessage', room);
  }
  watchMessages(){
    return new Observable((msgObserver)=>{
      this.socket.on('newMsg', selectedRoomMsgs=>{
        msgObserver.next(selectedRoomMsgs);
      });
    });
  }
  sendRequest(userFrom:User, userTo:User, selectedRoom:Room){
    this.socket.emit('newRequest', {
      userFrom: userFrom,
      userTo: userTo,
      selectedRoom: selectedRoom
    });
  }
  watchRequests(){
    return new Observable((requestObserver)=>{
      this.socket.on('roomRequest', curUserRequests=>{
        requestObserver.next(curUserRequests);
      });
    });
  }
  updateRequest(request:Request, curUser:User, operation:string){
    this.socket.emit('updateRequest', {
      request: request,
      curUser: curUser, 
      operation: operation
    });
  }
  userIsTyping(username:string, roomID:string){
    this.socket.emit('userIsTyping', {
      username: username,
      roomID: roomID
    });
  }
  watchForUsersTyping(){
    return new Observable((typingObserver)=>{
      this.socket.on('userIsTyping', typingData=>{
        typingObserver.next(typingData);
      });
    });
  }
  //leave chat
  leave(userData:User){
    this.socket.emit('leaveApp', userData);
  }
}
