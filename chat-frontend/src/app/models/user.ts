import { Request } from "./request";

export class User{
    userID:string;
    profilePic:object;
    username:string;
    requests:Array<Request>;
    constructor(profilePic:object, username:string, userID?:string, requests?:Array<Request>){
        this.userID = userID;
        this.profilePic = profilePic;
        this.username = username;
        this.requests = requests || new Array<Request>();
    }
}