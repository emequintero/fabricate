import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Room } from '../models/room';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  selectedRoom:BehaviorSubject<Room> = new BehaviorSubject<Room>(null);
  constructor() { }

  setRoom(room:Room){
    this.selectedRoom.next(room);
  }

  getRoom(){
    return this.selectedRoom;
  }
}
