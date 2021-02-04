import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Message } from 'src/app/models/message';
import { Room } from 'src/app/models/room';
import { User } from 'src/app/models/user';
import { ChatService } from 'src/app/services/chat.service';
import { RoomService } from 'src/app/services/room.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-chatroom',
  templateUrl: './chatroom.component.html',
  styleUrls: ['./chatroom.component.sass']
})
export class ChatroomComponent implements OnInit {

  selectedRoom: Room = null;
  messageContent: string = "";
  curUser: User = null;
  headerUsers: Array<User> = null;
  constructor(private roomService: RoomService, private userService: UserService, private chatService: ChatService,
    private router:Router) { }

  ngOnInit(): void {
    this.userService.getUser().subscribe((user) => {
      this.curUser = user;
    });
    this.roomService.getRoom().subscribe((selectedRoom) => {
      this.selectedRoom = selectedRoom;
      if (this.selectedRoom) {
        //filters out curUser
        this.headerUsers = this.selectedRoom.users.filter(user => { return user.username !== this.curUser.username });
      }
    });
    //watch changes in messages
    this.chatService.watchMessages().subscribe((selectedRoomMsgs:Array<Message>)=>{
      this.selectedRoom.messages = selectedRoomMsgs;
      let lastMessage = document.getElementById('lastMsg');
      if(lastMessage){
        //clear blur for focused element
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        //focus on new message
        setTimeout(() => {
          document.getElementById('lastMsg').focus();
        }, 100);
      }
    });
    //watch changes for users in room
    this.chatService.watchRoomUsers().subscribe((roomUsers:Array<User>)=>{
      this.selectedRoom.users = roomUsers.map(user=>{
        return new User(user.profilePic, user.username, user.userID, user.role, user.requests);
      });
      this.roomService.setRoom(this.selectedRoom);
    });
  }

  sendMessage() {
    var newMessage = new Message(this.curUser, this.messageContent, new Date());
    this.selectedRoom.addMessage(newMessage);
    this.chatService.sendMessage(this.selectedRoom);
    //clear message input box text
    this.messageContent = "";
  }

  addUser(){
    this.router.navigate(['main','handle-room', 'add']);
  }

  determineDateFormat(dateSent: Date): string {
    //set up end of yesterday to compare
    let endOfYesterday = new Date();
    endOfYesterday.setHours(0, 0, 0, 0);
    //return shortTime if message sent today else return shortDate
    return (new Date(dateSent)) > endOfYesterday ? 'shortTime' : 'shortDate';
  }

  isNextMsgSameUser(curMsg: Message, nextMsg: Message): boolean {
    if (curMsg && nextMsg) {
      return curMsg.sentBy.userID === nextMsg.sentBy.userID;
    }
  }

  handleMsgTabIndex(){
    //last message will be -1 initially
    let tabIndex = '-1';
    //switch to 0 once more messages come in
    if(document.activeElement.id !== 'lastMsg'){
      tabIndex = '0';
    }
    return tabIndex;
  }

}
