import { Message } from "./message";
import { User } from "./user";

export class Room{
    roomID:string;
    users:Array<User> = new Array<User>();
    messages:Array<Message> = new Array<Message>();
    constructor(users:Array<User>, messages?:Array<Message>, roomID?:string){
        this.users = users;
        this.messages = messages || new Array<Message>();
        this.roomID = roomID || undefined;
    }
    addUser(user){
        this.users.push(user);
    }
    removeUser(user){
        this.users.splice(this.users.indexOf(user), 1);
    }
    addMessage(newMessage:Message){
        this.messages.push(newMessage);
    }
}