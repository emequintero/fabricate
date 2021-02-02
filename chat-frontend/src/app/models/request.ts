import { Room } from "./room";
import { User } from "./user";

export class Request{
    sentBy:User;
    room:Room;
    status:string;
    requestID:string;
    constructor(sentBy:User, room:Room, status:string, requestID?:string){
        this.sentBy = sentBy;
        this.room = room;
        this.status = status;
        this.requestID = requestID;
    }
}