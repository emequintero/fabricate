let app, server, io, running;
//used for prod initialization and automated testing
const init = () => {
    app = require('express')();
    server = app.listen(5000, () => { });
    io = require('socket.io')(server, { cors: '*' });
    running = true;
    /**
     * FRONTEND BOUND EVENTS:
     * joinApp: returns user object with userID (socket.id)
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
     * joinApp: assigns userID to current user and emits joinApp event
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
    let availableUsers = [];
    let availableRooms = [];

    /**
     * UTILITY FUNCTIONS
     */

    //Generate room ID for new rooms
    generateID = () => {
        let text = "";
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
        for (let i = 0; i < 50; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
    //filter rooms by userID
    getCurUserRooms = (userID) => {
        return availableRooms.filter(room => {
            //compare using user ID
            return room.users.find(user => { return user.userID === userID; });
        });
    }

    //filter rooms by userID with accepted room request
    getCurUserAcceptedRooms = (userID) => {
        let curUserRooms = getCurUserRooms(userID);
        let userRequestRoomIDs = getUser(userID).requests.map(request => {
            return request.room.roomID;
        });
        return curUserRooms.filter(room => {
            return userRequestRoomIDs.indexOf(room.roomID) === -1;
        });
    }

    //get room from available rooms by roomID
    getRoomByID = (roomID) => {
        return availableRooms.find(room => {
            return room.roomID === roomID;
        });
    }

    //get user from availableUsers
    getUser = (userID) => {
        return availableUsers.find(user => {
            return user.userID === userID;
        });
    }

    //get a user within a room
    getUserInRoom = (selectedRoom, userID) => {
        return selectedRoom.users.find(user => {
            return user.userID === userID;
        });
    }


    //send system message to a room
    sendSystemMessage = (selectedRoom, content) => {
        selectedRoom.messages.push({
            sentBy: {
                profilePic: '',
                username: 'Fabricate',
                userID: '',
                role: 'system'
            },
            content: content,
            dateSent: new Date()
        });
        io.to(selectedRoom.roomID).emit('newMsg', selectedRoom.messages);
    }

    //remove user from a room
    removeUserInRoom = (selectedRoom, userLeavingID) => {
        //remove user from room in availableRooms
        selectedRoom.users = selectedRoom.users.filter(user => {
            return user.userID !== userLeavingID;
        });
        //update actual users array in availableRooms
        availableRooms[availableRooms.indexOf(selectedRoom)].users = [].concat(selectedRoom.users);
        //return updated room
        return selectedRoom;
    }

    //get users in a room who have accepted the room request
    getAcceptedRoomUsers = (selectedRoom) => {
        //get userIDs of users associated with room
        let roomUserIDs = selectedRoom.users.map(user => {
            return user.userID;
        });
        //return only users associated with room who have accepted the request 
        //(requests are stored globally in availableUsers)
        return availableUsers.filter(user => {
            return roomUserIDs.indexOf(user.userID) !== -1 && !user.requests.some(request => {
                return request.room.roomID === selectedRoom.roomID;
            });
        });
    }

    //delete room if empty (update all original users) or update accepted users if not empty (don't delete)
    handleRoomUserCount = (selectedRoom, acceptedUsers, originalUsers, op) => {
        //check if only one user is in room or if no one has accepted and user who created is leaving
        if (selectedRoom.users.length === 1 || (acceptedUsers.length === 1 && op === 'leave')) {
            availableRooms = availableRooms.filter(room => {
                return room.roomID !== selectedRoom.roomID;
            });
            //update all original users since room was deleted
            return originalUsers;
        }
        else {
            //update only accepted users since there's still people in the room
            return acceptedUsers;
        }
    }

    //handle user leaving a room
    handleLeaveRoom = (selectedRoom, userLeaving, socket) => {
        //find associated room in availableRooms
        let foundRoom = getRoomByID(selectedRoom.roomID);
        //keep safe copy of room users
        let roomUsersSafe = [].concat(foundRoom.users);
        //get users in room who have accepted
        let roomUsersAccepted = getAcceptedRoomUsers(foundRoom);
        //remove user from room in availableRooms and update room data
        foundRoom = removeUserInRoom(foundRoom, userLeaving.userID);
        //update user list to users in room
        io.to(foundRoom.roomID).emit('updatedRoomUsers', foundRoom.users);
        //send system message to room that user has left
        sendSystemMessage(foundRoom, userLeaving.username + ' has left the room.');
        //check if no active users in chat (only one user in chat + leave event)
        if (roomUsersAccepted.length === 1) {
            //find users in room with pending requests (difference between roomUsersAvailable and og user list)
            let roomUsersPendingRequest = roomUsersSafe.filter(user => {
                return roomUsersAccepted.indexOf(user) === -1;
            });
            //delete request for this room for all users with pending request
            roomUsersPendingRequest.forEach(user => {
                //delete request from user's pending list
                user.requests = user.requests.filter(request => {
                    return request.room.roomID !== selectedRoom.roomID;
                });
                //update request list for user
                io.to(user.userID).emit('roomRequest', user.requests);
            });
        }
        //delete room if empty (update all original users) or update accepted users if not empty (don't delete)
        let usersToEmitUpdate = handleRoomUserCount(foundRoom, roomUsersAccepted, roomUsersSafe, 'leave');
        //individually send updated user rooms with accepted room requests (each belongs to unique set of rooms)
        usersToEmitUpdate.forEach(user => {
            let userUpdatedRooms = getCurUserAcceptedRooms(user.userID);
            io.to(user.userID).emit('updatedCurUserRooms', userUpdatedRooms);
        });
        //leave room
        socket.leave(selectedRoom.roomID);
    }

    io.on('connect', (socket) => {
        let roomsCurUser = null;
        let roomVisitHistory = [];
        //user joining app (add to availableUsers)
        socket.on('joinApp', (userData) => {
            if (userData) {
                //emit join event with added userID
                userData.userID = socket.id;
                availableUsers.push(userData);
                socket.emit('joinApp', userData);
                //update user list in UI
                io.sockets.emit('availableUsers', availableUsers);
            }
        });
        //user leaving chat
        socket.on('leaveApp', (userData) => {
            //only handle leaving if the user was logged in at one point
            if (userData) {
                //remove from all associated rooms
                let roomsCurUser = getCurUserRooms(userData.userID);
                roomsCurUser.forEach(selectedRoom => {
                    //handle leaving each room
                    handleLeaveRoom(selectedRoom, userData, socket);
                });
                //remove from available users
                let userToRemove = availableUsers.find(user => { return user.username === userData.username; });
                availableUsers.splice(availableUsers.indexOf(userToRemove), 1);
                //update available user list after leaving
                io.sockets.emit('availableUsers', availableUsers);
            }
        });
        //show available users
        socket.on('availableUsers', () => {
            io.sockets.emit('availableUsers', availableUsers);
        });
        //user is entering room
        socket.on('enterRoom', (enterRoomData) => {
            let foundRoom = null;
            //create room if one doesn't exist (no match for roomID)
            if (!enterRoomData.selectedRoom.roomID) {
                availableRooms.push(enterRoomData.selectedRoom);
                //set foundRoom to new room (provided by front-end)
                foundRoom = enterRoomData.selectedRoom;
                //set up id for new room (needed for initial room setup, but is replaced by socket io hashed value)
                foundRoom.roomID = generateID();
            }
            else {
                //get room from availableRooms by ID
                foundRoom = getRoomByID(enterRoomData.selectedRoom.roomID)
            }
            /**
             * Up to date socket rooms 'Array.from(socket.rooms)' required for each part of the following process:
             * 
            */
            //pre-join rooms for cur user
            let preJoinSocketRooms = Array.from(socket.rooms);
            //leave previous room if user is joining new one
            if (foundRoom && foundRoom.roomID && preJoinSocketRooms.length > 1) {
                let prevRoom = preJoinSocketRooms.pop();
                socket.leave(prevRoom);
            }
            //join room
            socket.join(foundRoom.roomID);
            //post-join rooms for cur user
            let postJoinSocketRooms = Array.from(socket.rooms);
            //set actual roomID based on socket io hashed value (second element because first is default socket room)
            foundRoom.roomID = postJoinSocketRooms.pop();
            //get rooms with user in it with accepted room requests
            roomsCurUser = getCurUserAcceptedRooms(enterRoomData.userEntering.userID);
            //send room with ID to frontend (only to cur user so others don't get UI changes when they haven't performed actions)
            io.to(enterRoomData.userEntering.userID).emit('selectedRoom', foundRoom);
            //send rooms for curUser to frontend to curUser
            io.to(enterRoomData.userEntering.userID).emit('updatedCurUserRooms', roomsCurUser);
            //send system message to room that user has joined chat and hasn't joined room before
            if (roomVisitHistory.indexOf(foundRoom.roomID) === -1) {
                sendSystemMessage(foundRoom, enterRoomData.userEntering.username + ' has joined the chat.');
            }
            //add to visit history
            roomVisitHistory.push(foundRoom.roomID);
        });
        //leave a room
        socket.on('leaveRoom', (leaveRoomData) => {
            //handle leaving room
            handleLeaveRoom(leaveRoomData.selectedRoom, leaveRoomData.userLeaving, socket);
        });
        //send new request to specific user
        socket.on('newRequest', (newRequestData) => {
            //get room by id
            let foundRoom = getRoomByID(newRequestData.selectedRoom.roomID);
            //get user request is sent to
            let userInRoom = getUserInRoom(foundRoom, newRequestData.userTo.userID);
            //check if current user is in selected room
            if (!userInRoom) {
                //add user to room in availableRooms if they don't exist (needed for handling add user)
                foundRoom.users.push(newRequestData.userTo);
                //update found user
                userInRoom = newRequestData.userTo;
            }
            //find user in available users
            let foundUser = getUser(newRequestData.userTo.userID);
            //add new request with new requestID
            foundUser.requests.push({
                sentBy: newRequestData.userFrom,
                room: newRequestData.selectedRoom,
                status: 'pending',
                requestID: generateID()
            });
            //emit updated request list
            io.to(newRequestData.userTo.userID).emit('roomRequest', foundUser.requests);
        });
        //update request by removing it from user's queue
        socket.on('updateRequest', (updateRequestData) => {
            //find associated room
            let foundRoom = getRoomByID(updateRequestData.request.room.roomID);
            //find user-who-updated in found room
            let foundUser = getUser(updateRequestData.curUser.userID);
            //keep safe copy of room users
            let roomUsersSafe = [].concat(foundRoom.users);
            //remove request from list
            foundUser.requests = foundUser.requests.filter(request => {
                return request.requestID !== updateRequestData.request.requestID;
            });
            //emit updated request list (applies for any operation)
            io.to(updateRequestData.curUser.userID).emit('roomRequest', foundUser.requests);
            //handle accepted room request
            if (updateRequestData.operation === 'accepted') {
                //get users in room who have accepted the request (for emitting update events)
                let roomUsersAccepted = getAcceptedRoomUsers(foundRoom);
                //update user list to users in room
                io.to(foundRoom.roomID).emit('updatedRoomUsers', foundRoom.users);
                //individually send updated user rooms with accepted room request to all other users 
                //(each belongs to unique set of rooms)
                roomUsersAccepted.forEach(user => {
                    let userUpdatedRooms = getCurUserAcceptedRooms(user.userID);
                    io.to(user.userID).emit('updatedCurUserRooms', userUpdatedRooms);
                });
            }
            //handle denied room request
            else if (updateRequestData.operation === 'denied') {
                //remove user from room in availableRooms
                foundRoom = removeUserInRoom(foundRoom, updateRequestData.curUser.userID);
                //update user list to users in room
                io.to(foundRoom.roomID).emit('updatedRoomUsers', foundRoom.users);
                //send system message to room that user has denied request
                sendSystemMessage(foundRoom, updateRequestData.curUser.username + ' has denied the request to join.');
                //get users in room who have accepted the request (for emitting update events)
                let roomUsersAccepted = getAcceptedRoomUsers(foundRoom);
                //delete room if empty (update all original users) or update accepted users if not empty (don't delete)
                let usersToEmitUpdate = handleRoomUserCount(foundRoom, roomUsersAccepted, roomUsersSafe, 'deniedRequest');
                //individually send updated user rooms to all users originally associated in room (each belongs to unique set of rooms)
                usersToEmitUpdate.forEach(user => {
                    let userUpdatedRooms = getCurUserAcceptedRooms(user.userID);
                    io.to(user.userID).emit('updatedCurUserRooms', userUpdatedRooms);
                });
            }
        });
        //relay chat data (handle & message) to sockets in room
        socket.on('sendMessage', (selectedRoom) => {
            //add messages to room
            getRoomByID(selectedRoom.roomID).messages = selectedRoom.messages;
            //return room to allowed users
            io.to(selectedRoom.roomID).emit('newMsg', selectedRoom.messages);
        });
        //broadcast handle that is typing to available sockets
        //goes to all except the socket that emitted the typing event
        socket.on('userIsTyping', (typingData) => {
            socket.to(typingData.roomID).emit('userIsTyping', typingData.username);
        });
    });
}

//used for automated testing
const close = () =>{
    running = false;
    server.close();
}

//start app by default
init();

module.exports = {init, close, running};