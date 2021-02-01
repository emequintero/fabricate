var app = require('express')();
server = app.listen(5000,function(){
  console.log("server live on port 5000!");
});
var io = require('socket.io')(server, {cors: '*'});
var availableUsers = [];
var availableRooms = [];

//sort user array by username
compareUsers = (a,b) =>{
    return a.username.localeCompare(b.username);
}

//Generate room ID for new rooms
generateRoomID = () =>{
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
    for(let i = 0; i < 10; i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

io.on('connect',(socket) => {
    console.log('Socket: Client Connected');
    let roomsCurUser = null;
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
        //check if there's already a room with the same users
        let foundRoom = availableRooms.find(room=>{
            //sort arrays so rooms aren't duplicated
            return JSON.stringify(room.users.sort(compareUsers)) === JSON.stringify(enterRoomData.selectedRoom.users.sort(compareUsers))
        });
        //create room if one doesn't exist (unique combination of users)
        if(!foundRoom){
            availableRooms.push(enterRoomData.selectedRoom);
            //set foundRoom to new room (provided by front-end)
            foundRoom = enterRoomData.selectedRoom;
            //set up id for new room (needed for initial room setup, but is replaced by socket io hashed value)
            foundRoom.roomID = generateRoomID();
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
        roomsCurUser = availableRooms.filter(room=>{
            //compare using user ID
            return room.users.find(user=>{return user.userID === enterRoomData.userEntering.userID;});
        });
        //send room with ID to frontend (only to cur user so others don't get UI changes when they haven't performed actions)
        io.to(enterRoomData.userEntering.userID).emit('roomData', {
            selectedRoom: foundRoom,
            roomsCurUser: roomsCurUser
        });
    });
    //relay chat data (handle & message) to sockets in room
    socket.on('sendMessage', function(selectedRoom){
        //add messages to room
        availableRooms.find(room=>{
            //sort arrays so rooms aren't duplicated
            return JSON.stringify(room.users.sort(compareUsers)) === JSON.stringify(selectedRoom.users.sort(compareUsers))
        }).messages = selectedRoom.messages;
        //socket Room Set to array
        let userRooms = Array.from(socket.rooms);
        //get rooms with user in it
        roomsCurUser = availableRooms.filter(room=>{
            return userRooms.indexOf(room.roomID) !== -1;
        });
        //return room to allowed users
        io.to(selectedRoom.roomID).emit('newMsg', selectedRoom.messages);
    });
    //broadcast handle that is typing to available sockets
    //goes to all except the socket that emitted the typing event
    socket.on('typing', function(username){
        socket.broadcast.emit('typing', username);
    });
});