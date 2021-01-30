import { User } from "./user";

export class Message{
    sentBy:User;
    content:string;
    dateSent:Date;
    constructor(sentBy:User, content: string, dateSent:Date){
        this.sentBy = sentBy;
        this.content = content;
        this.dateSent = dateSent;
    }
}