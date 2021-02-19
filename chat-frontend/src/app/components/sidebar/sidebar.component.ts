import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Room } from 'src/app/models/room';
import { User } from 'src/app/models/user';
import { Request } from 'src/app/models/request';
import { ChatService } from 'src/app/services/chat.service';
import { RoomService } from 'src/app/services/room.service';
import { UserService } from 'src/app/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.sass']
})
export class SidebarComponent implements OnInit, OnDestroy{
  public sideBarHidden = true;
  public curUser:User = null;
  public selectedRoom:Room = null;
  public roomsCurUser:Array<Room> = new Array<Room>();
  public formattedRoomsCurUser:Array<any> = new Array<any>();
  public joinAppSub:Subscription = new Subscription();
  public roomsCurUserSub:Subscription = new Subscription();
  public watchRoomsCurUserSub:Subscription = new Subscription();
  public requestsSub:Subscription = new Subscription();
  public enterRoomSub:Subscription = new Subscription();
  public selectedRoomSub:Subscription = new Subscription();
  @ViewChild('sideBar') sidebar:ElementRef;
  //listens for mousedown in document and injects event to callback function
  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event){
    //close sidenav if user clicks outside it and sidebar is open
    if(!this.sidebar.nativeElement.contains(event.target) && !this.sideBarHidden){
      this.toggleSideBar();
    }
  }
  constructor(private chatService:ChatService, private userService:UserService, 
    private roomService:RoomService, public router:Router) { }
  public ngOnDestroy(): void {
    //unsubscribe from events/updates
    this.joinAppSub.unsubscribe();
    this.roomsCurUserSub.unsubscribe();
    this.watchRoomsCurUserSub.unsubscribe();
    this.requestsSub.unsubscribe();
    this.enterRoomSub.unsubscribe();
    this.selectedRoomSub.unsubscribe();
  }

  public ngOnInit(): void {
    //join chat
    this.curUser = this.userService.getUser().value;
    this.joinAppSub = this.chatService.joinApp(this.curUser).subscribe(curUser=>{
      this.curUser = new User(curUser.profilePic, curUser.username, curUser.userID, curUser.role);
      this.userService.setUser(this.curUser);
    });
    //watch changes/update rooms for current user shareable resource
    this.roomsCurUserSub = this.roomService.getRoomsCurUser().subscribe(roomsCurUser=>{
      this.roomsCurUser = roomsCurUser;
      if(this.roomsCurUser){
        this.formattedRoomsCurUser = this.formatRooms(this.roomsCurUser);
      }
    });
    //watch changes for selected room
    this.selectedRoomSub = this.roomService.getRoom().subscribe(selectedRoom=>{
      this.selectedRoom = selectedRoom;
    });
    //watch changes for requests
    this.requestsSub = this.chatService.watchRequests().subscribe((requests:Array<Request>)=>{
      let userRequests = requests.map((request:Request)=>{return new Request(request.sentBy, request.room, request.status, request.requestID)})
      this.curUser = new User(this.curUser.profilePic, this.curUser.username, this.curUser.userID, this.curUser.role, userRequests);
      this.userService.setUser(this.curUser);
    });
    //watch changes for current user rooms event
    this.watchRoomsCurUserSub = this.chatService.watchCurUserRooms().subscribe((roomsCurUser:Array<Room>)=>{
        //update available rooms
        let updatedRoomsCurUser = roomsCurUser.map(room=>{
          return new Room(room.users, room.messages, room.roomID);
        });
        //update roomsCurUser in shareable resource
        this.roomService.setRoomsCurUser(updatedRoomsCurUser);
    });
  }

  public toggleSideBar(){
    this.sideBarHidden = !this.sideBarHidden;
  }

  public createRoom(){
    //close sidebar
    this.toggleSideBar();
    //open create room child-view
    this.router.navigate(['handle-room', 'create']);
  }

  public sendHome(){
    //close sidebar
    this.toggleSideBar();
    //open create room child-view
    this.router.navigate(['home']);
  }

  public showNotifications(){
    //close sidebar
    this.toggleSideBar();
    //open create room child-view
    this.router.navigate(['notifications']);
  }

  public enterRoom(viewFriendlyRoom:any){
    //close sidebar
    this.toggleSideBar();
    //format room properly (no view related properties)
    let roomToSwitchTo:Room = new Room(viewFriendlyRoom.users, viewFriendlyRoom.messages, viewFriendlyRoom.roomID);
    //enter room
    this.enterRoomSub = this.chatService.enterRoom(this.curUser, roomToSwitchTo).subscribe((selectedRoom:Room)=>{
      //update current room
      let updatedRoom = new Room(selectedRoom.users, selectedRoom.messages, selectedRoom.roomID);
      //update room in shareable resource
      this.roomService.setRoom(updatedRoom);
      //if user is on other page take them to chat
      if(this.router.url !== '/chat-room'){
        this.router.navigate(['chat-room']);
      }
    });
  }

  public isRoomSelected(roomID:string){
    if(this.selectedRoom){
      return this.selectedRoom.roomID === roomID;
    }
    else{
      return false;
    }
  }

  public formatRooms(rooms:Array<any>){
    return rooms.map(room=>{
      room.headerUsers = room.users.filter((user:User)=>{
        return user.userID !== this.curUser.userID;
      });
      return room;
    })
  }

}
