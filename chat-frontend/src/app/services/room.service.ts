import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Room } from '../models/room';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  roomsCurUser:BehaviorSubject<Array<Room>> = new BehaviorSubject<Array<Room>>(null);
  selectedRoom:BehaviorSubject<Room> = new BehaviorSubject<Room>(null);
  constructor() { }

  setRoom(room:Room){
    this.selectedRoom.next(room);
  }

  getRoom():BehaviorSubject<Room>{
    return this.selectedRoom;
  }

  setRoomsCurUser(roomsCurUser:Array<Room>){
    this.roomsCurUser.next(roomsCurUser);
  }

  getRoomsCurUser():BehaviorSubject<Array<Room>>{
    return this.roomsCurUser;
  }
}
