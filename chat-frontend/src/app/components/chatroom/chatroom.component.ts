import { Component, OnInit } from '@angular/core';
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
  constructor(private roomService: RoomService, private userService: UserService, private chatService: ChatService) { }

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
  }

  sendMessage() {
    var newMessage = new Message(this.curUser, this.messageContent, new Date());
    this.selectedRoom.addMessage(newMessage);
    this.chatService.sendMessage(this.selectedRoom);
    //clear message input box text
    this.messageContent = "";
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
      return curMsg.sentBy.username === nextMsg.sentBy.username;
    }
  }

}
