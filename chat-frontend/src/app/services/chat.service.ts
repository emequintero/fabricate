import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from 'src/environments/environment';
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
      this.socket.on('roomData', roomData=>{
        roomObserver.next(roomData);
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
  watchRequests(){
    return new Observable((requestObserver)=>{
      this.socket.on('roomRequest', curUserRequests=>{
        requestObserver.next(curUserRequests);
      });
    });
  }
  //leave chat
  leave(userData:User){
    this.socket.emit('leave', userData);
  }
}
