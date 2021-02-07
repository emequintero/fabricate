var app = require('express')();
server = app.listen(5000,function(){
  console.log("server live on port 5000!");
});
var io = require('socket.io')(server, {cors: '*'});
/**
 * FRONTEND BOUND EVENTS:
 * join: returns user object with userID (socket.id)
 * availableUsers: returns array of online users
 * selectedRoom: returns room object that user is currently in
 *      -if new room it adds actual roomID (socket.io room ID) to room object
 * updatedCurUserRooms: returns array of rooms user is currently associated with
 * newMsg: returns array of messages within a room
 * roomRequest: returns a request to join room
 * updatedRoomUsers: returns array of users currently in a room (used for handling request denial)
 * typing: returns username of user typing in a room
 * 
 * BACKEND BOUND EVENTS:
 * join: assigns userID to current user and emits join event
 *      -also emits availableUsers to all sockets if there is more than one person in the chat
 * leave: removes current user from available users and all associated rooms
 *      -also sends system message to all previously associated rooms saying they left
 * availableUsers: emits availableUsers event
 * enterRoom: gets room from availableUsers/creates a new room if none is found 
 *      -compares by sorted user array in room to avoid duplicates
 *      -current socket leaves previous room before joining new one (avoids emitting events to wrong room)
 *      -emits updatedCurUserRooms and selectedRoom events
 *      -sends system message that user has joined
 *      -keeps track of visited room history so system message is only sent when first joining
 * leaveRoom: makes current user leave a room and sends system message that they left
 * newRequest: formats and adds request to designated user
 *      -emits roomRequest event to designated user
 * updateRequest: handles accepting/denying room request and removes request from user's queue
 *      -if denied removes user from requested room
 *      -if denied emits updatedRoomUsers to requested room
 *      -if denied sends system message to requested room that they denied
 *      -if denied emits updatedCurUserRooms to users in requested room and current user
 * sendMessage: adds new message to associated room and emits newMsg event
 *      -updates rooms for current user so they contain all up to date messages
 *          -even if they're currently in a different room
 * typing: emits typing event
 */
var availableUsers = [];
var availableRooms = [];

//Generate room ID for new rooms
generateID = () =>{
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
    for(let i = 0; i < 10; i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//filter rooms by userID
getCurUserRooms = (userID) =>{
    return availableRooms.filter(room=>{
        //compare using user ID
        return room.users.find(user=>{return user.userID === userID;});
    });
}

getRoomByID = (roomID) =>{
    return availableRooms.find(room=>{
        return room.roomID === roomID;
    });
}

getUserInRoom = (room, userID) =>{
    return room.users.find(user=>{
        return user.userID === userID;
    });
}

io.on('connect',(socket) => {
    console.log('Socket: Client Connected');
    let roomsCurUser = null;
    let roomVisitHistory = [];
    //user joining chat (add to availableUsers)
    socket.on('join', function(userData){
        //emit join event with added userID
        userData.userID = socket.id;
        availableUsers.push(userData);
        socket.emit('join', userData);
        //mmore than one user available, so update list in UI
        if(availableUsers.length > 1){
            io.sockets.emit('availableUsers', availableUsers);
        }
    });
    //user leaving chat (remove from availableUsers)
    socket.on('leave', function(userData){
        let userToRemove = availableUsers.find(user=>{return user.username === userData.username;});
        availableUsers.splice(availableUsers.indexOf(userToRemove), 1);
    });
    //show available users
    socket.on('availableUsers', function(){
        io.sockets.emit('availableUsers', availableUsers);
    });
    //user is entering room
    socket.on('enterRoom', function(enterRoomData){
        let foundRoom = null;
        //create room if one doesn't exist (no match for roomID)
        if(!enterRoomData.selectedRoom.roomID){
            availableRooms.push(enterRoomData.selectedRoom);
            //set foundRoom to new room (provided by front-end)
            foundRoom = enterRoomData.selectedRoom;
            //set up id for new room (needed for initial room setup, but is replaced by socket io hashed value)
            foundRoom.roomID = generateID();
        }
        else{
            //get room from availableRooms by ID
            foundRoom = getRoomByID(enterRoomData.selectedRoom.roomID)
        }
        /**
         * Up tp date socket rooms 'Array.from(socket.rooms)' required for each part of the following process:
         * 
        */
        //pre-join rooms for cur user
        let preJoinSocketRooms = Array.from(socket.rooms);
        //leave previous room if user is joining new one
        if(foundRoom && foundRoom.roomID && preJoinSocketRooms.length > 1){
            let prevRoom = preJoinSocketRooms.pop();
            socket.leave(prevRoom);
        }
        //join room
        socket.join(foundRoom.roomID);
        //post-join rooms for cur user
        let postJoinSocketRooms = Array.from(socket.rooms);
        //set actual roomID based on socket io hashed value (second element because first is default socket room)
        foundRoom.roomID = postJoinSocketRooms.pop();
        //get rooms with user in it
        roomsCurUser = getCurUserRooms(enterRoomData.userEntering.userID);
        //send room with ID to frontend (only to cur user so others don't get UI changes when they haven't performed actions)
        io.to(enterRoomData.userEntering.userID).emit('selectedRoom', foundRoom);
        //send rooms for curUser to frontend to curUser
        io.to(enterRoomData.userEntering.userID).emit('updatedCurUserRooms', roomsCurUser);
        //send system message to room that user has joined chat and hasn't joined room before
        if(roomVisitHistory.indexOf(foundRoom.roomID) === -1){
            foundRoom.messages.push({
                sentBy: {
                    profilePic: '',
                    username: 'Fabricate',
                    userID: '',
                    role: 'system'
                },
                content: enterRoomData.userEntering.username + ' has joined the chat.',
                dateSent: new Date()
            });
            io.to(foundRoom.roomID).emit('newMsg', foundRoom.messages);
        }
        //add to visit history
        roomVisitHistory.push(foundRoom.roomID);
    });
    //leave a room
    socket.on('leaveRoom', function(leaveRoomData){
        let foundRoom = getRoomByID(leaveRoomData.selectedRoom.roomID);
        //remove user from room in availableRooms
        foundRoom.users = foundRoom.users.filter(user=>{
            return user.userID !== leaveRoomData.userLeaving.userID;
        });
        //update actual users array in availableRooms
        availableRooms[availableRooms.indexOf(foundRoom)].users = [].concat(foundRoom.users);
        //update user list to users in room
        io.to(foundRoom.roomID).emit('updatedRoomUsers', foundRoom.users);
        //send system message to room that user has left
        foundRoom.messages.push({
            sentBy: {
                profilePic: '',
                username: 'Fabricate',
                userID: '',
                role: 'system'
            },
            content: leaveRoomData.userLeaving.username + ' has left the room.',
            dateSent: new Date()
        });
        io.to(foundRoom.roomID).emit('newMsg', foundRoom.messages);
        //delete room from availableRooms if only one user is in it
        if(foundRoom.users.length === 1){
            availableRooms = availableRooms.filter(room=>{
                return room.roomID !== leaveRoomData.selectedRoom.roomID;
            });
        }
        //individually send updated user rooms to all other users in room (each belongs to unique set of rooms)
        foundRoom.users.forEach(user=>{
            let userUpdatedRooms = getCurUserRooms(user.userID);
            io.to(user.userID).emit('updatedCurUserRooms', userUpdatedRooms);
        });
        //update for user rooms for current user
        let curUserUpdatedRooms = getCurUserRooms(leaveRoomData.userLeaving.userID);
        io.to(leaveRoomData.userLeaving.userID).emit('updatedCurUserRooms', curUserUpdatedRooms);
        //leave room
        socket.leave(leaveRoomData.selectedRoom.roomID);
    });
    //send new request to specific user
    socket.on('newRequest', function(newRequestData){
        //add new request with new requestID
        newRequestData.userTo.requests.push({
            sentBy: newRequestData.userFrom,
            room: newRequestData.selectedRoom,
            status: 'pending',
            requestID: generateID()
        });
        //emit updated request list
        io.to(newRequestData.userTo.userID).emit('roomRequest', newRequestData.userTo.requests);
    });
    //update request by removing it from user's queue
    socket.on('updateRequest', function(updateRequestData){
        //find associated room
        let foundRoom = getRoomByID(updateRequestData.request.room.roomID);
        //find user-who-updated in found room
        let foundUser = getUserInRoom(foundRoom, updateRequestData.curUser.userID);
        //check if current user is in selected room
        if(!foundUser){
            //add user to room in availableRooms if they don't exist (needed for handling add user)
            foundRoom.users.push(updateRequestData.curUser);
            //update found user
            foundUser = updateRequestData.curUser;
        }
        //remove request from list
        foundUser.requests = foundUser.requests.filter(request=>{
            return request.requestID !== updateRequestData.request.requestID;
        });
        //update actual requests
        getUserInRoom(foundRoom, updateRequestData.curUser.userID).requests = foundUser.requests;
        //emit updated request list (applies for any operation)
        io.to(updateRequestData.curUser.userID).emit('roomRequest', foundUser.requests);
        //handle accepted room request
        if(updateRequestData.operation === 'accepted'){
            //update user list to users in room
            io.to(foundRoom.roomID).emit('updatedRoomUsers', foundRoom.users);
            //individually send updated user rooms to all other users in room (each belongs to unique set of rooms)
            foundRoom.users.forEach(user=>{
                let userUpdatedRooms = getCurUserRooms(user.userID);
                io.to(user.userID).emit('updatedCurUserRooms', userUpdatedRooms);
            });
        }
        //handle denied room request
        else if(updateRequestData.operation === 'denied'){
            //remove user from room in availableRooms
            foundRoom.users = foundRoom.users.filter(user=>{
                return user.userID !== updateRequestData.curUser.userID;
            });
            //update actual users array in availableRooms
            availableRooms[availableRooms.indexOf(foundRoom)].users = [].concat(foundRoom.users);
            //update user list to users in room
            io.to(foundRoom.roomID).emit('updatedRoomUsers', foundRoom.users);
            //send system message to room that user has denied request
            foundRoom.messages.push({
                sentBy: {
                    profilePic: '',
                    username: 'Fabricate',
                    userID: '',
                    role: 'system'
                },
                content: updateRequestData.curUser.username + ' has denied the request to join.',
                dateSent: new Date()
            });
            io.to(foundRoom.roomID).emit('newMsg', foundRoom.messages);
            //individually send updated user rooms to all other users in room (each belongs to unique set of rooms)
            foundRoom.users.forEach(user=>{
                let userUpdatedRooms = getCurUserRooms(user.userID);
                io.to(user.userID).emit('updatedCurUserRooms', userUpdatedRooms);
            });
            //update for user rooms for curUser
            let curUserUpdatedRooms = getCurUserRooms(updateRequestData.curUser.userID);
            io.to(updateRequestData.curUser.userID).emit('updatedCurUserRooms', curUserUpdatedRooms);
        }
    });
    //relay chat data (handle & message) to sockets in room
    socket.on('sendMessage', function(selectedRoom){
        //add messages to room
        getRoomByID(selectedRoom.roomID).messages = selectedRoom.messages;
        //return room to allowed users
        io.to(selectedRoom.roomID).emit('newMsg', selectedRoom.messages);
    });
    //broadcast handle that is typing to available sockets
    //goes to all except the socket that emitted the typing event
    socket.on('userIsTyping', function(typingData){
        socket.to(typingData.roomID).emit('userIsTyping', typingData.username);
    });
});