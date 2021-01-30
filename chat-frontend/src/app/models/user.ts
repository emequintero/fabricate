export class User{
    userID:string;
    profilePic:object;
    username:string;
    constructor(profilePic:object, username:string, userID?:string){
        this.userID = userID;
        this.profilePic = profilePic;
        this.username = username;
    }
}