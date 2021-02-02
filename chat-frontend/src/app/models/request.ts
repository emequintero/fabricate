import { User } from "./user";

export class Request{
    sentBy:User;
    status:string;
    constructor(sentBy:User){
        this.sentBy = sentBy;
        this.status = 'add';
    }
}