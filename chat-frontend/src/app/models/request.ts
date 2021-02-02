import { User } from "./user";

export class Request{
    sentBy:User;
    status:string;
    requestID:string;
    constructor(sentBy:User, status:string, requestID?:string){
        this.sentBy = sentBy;
        this.status = status;
        this.requestID = requestID;
    }
}