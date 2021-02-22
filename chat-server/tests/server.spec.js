const io = require('socket.io-client');
const should = require('should');
const fabricate = require('../server');
if(fabricate.running){
    fabricate.close();
}
let BASE_URL = 'http://localhost:5000';
let socketOptions = {
    transports: ['websocket'],
    'reconnection delay' : 0,
    'reopen delay' : 0,
    'force new connection' : true
};
let mila, lula;

describe('Fabricate Chat Server', ()=>{
    let milasocket = null;
    beforeEach((done)=>{
        fabricate.init();
        mila = {
            profilePic: {},
            username: 'Mila',
            role: 'user',
            requests: []
        };
        lula = {
            profilePic: {},
            username: 'Lula',
            role: 'user',
            requests: []
        }
        milasocket = io(BASE_URL, socketOptions);
        milasocket.on('connect', ()=>{
            done();
        });
    });
    afterEach((done)=>{
        fabricate.close();
        if(milasocket.connected) {
            milasocket.disconnect();
        }
        done();
    });
    it('should connect on load', (done)=>{
        should(milasocket).be.ok();
        done();
    });
    it('should return user with userID when joining app', (done)=>{
        milasocket.emit('joinApp', mila);
        milasocket.on('joinApp', (milaData)=>{
            mila = milaData;
            should(mila).have.property('userID');
            done();
        });
    });
    it('should emit available users when joining app', (done)=>{
        milasocket.emit('joinApp', mila);
        milasocket.on('joinApp', ()=>{
            milasocket.on('availableUsers', (updatedAvailableUsers)=>{
                availableUsers = [].concat(updatedAvailableUsers);
                should(availableUsers.length).equal(1);
                done();
            });
        });
    }); 
    it('should be able to create room', (done)=>{
        milasocket.emit('joinApp', mila);
        milasocket.on('joinApp', (milaData)=>{
            mila = milaData;
            let lulasocket = io(BASE_URL, socketOptions);
            lulasocket.emit('joinApp', lula);
            lulasocket.on('joinApp', (lulaData)=>{
                lula = lulaData;
                let room = {
                    users: [mila, lula],
                    messages: []
                }
                milasocket.emit('enterRoom', {
                    selectedRoom: room,
                    userEntering: mila
                });
                milasocket.on('selectedRoom', (updatedSelectedRoom)=>{
                    room = updatedSelectedRoom;
                    should(room).have.property('roomID');
                    done();
                });
            });
        });
    });
    it('should receive system message when joining room', (done)=>{
        milasocket.emit('joinApp', mila);
        milasocket.on('joinApp', (milaData)=>{
            mila = milaData;
            let lulasocket = io(BASE_URL, socketOptions);
            lulasocket.emit('joinApp', lula);
            lulasocket.on('joinApp', (lulaData)=>{
                lula = lulaData;
                let room = {
                    users: [mila, lula],
                    messages: []
                }
                milasocket.emit('enterRoom', {
                    selectedRoom: room,
                    userEntering: mila
                });
                milasocket.on('selectedRoom', (updatedSelectedRoom)=>{
                    room = updatedSelectedRoom;
                    milasocket.on('newMsg', (updatedMessages)=>{
                        room.messages = updatedMessages;
                        should(room.messages.length).equal(1);
                        done();
                    });
                });
            });
        });
    });
    it('should be able to send a room request', (done)=>{
        milasocket.emit('joinApp', mila);
        milasocket.on('joinApp', (milaData)=>{
            mila = milaData;
            let lulasocket = io(BASE_URL, socketOptions);
            lulasocket.emit('joinApp', lula);
            lulasocket.on('joinApp', (lulaData)=>{
                lula = lulaData;
                let room = {
                    users: [mila, lula],
                    messages: []
                }
                milasocket.emit('enterRoom', {
                    selectedRoom: room,
                    userEntering: mila
                });
                milasocket.on('selectedRoom', (updatedSelectedRoom)=>{
                    room = updatedSelectedRoom;
                    milasocket.emit('newRequest', {
                        userFrom: mila,
                        userTo: lula,
                        selectedRoom: room
                    });
                    lulasocket.on('roomRequest', (updatedRequests)=>{
                        lula.requests = [].concat(updatedRequests);
                        should(lula.requests[0]).have.property('requestID');
                        done();
                    });
                });
            });
        });
    });
    it('should be able to accept a room request', (done)=>{
        milasocket.emit('joinApp', mila);
        milasocket.on('joinApp', (milaData)=>{
            mila = milaData;
            let lulasocket = io(BASE_URL, socketOptions);
            lulasocket.emit('joinApp', lula);
            lulasocket.on('joinApp', (lulaData)=>{
                lula = lulaData;
                let room = {
                    users: [mila, lula],
                    messages: []
                }
                milasocket.emit('enterRoom', {
                    selectedRoom: room,
                    userEntering: mila
                });
                milasocket.on('selectedRoom', (updatedSelectedRoom)=>{
                    room = updatedSelectedRoom;
                    milasocket.emit('newRequest', {
                        userFrom: mila,
                        userTo: lula,
                        selectedRoom: room
                    });
                    lulasocket.on('roomRequest', (updatedRequests)=>{
                        lula.requests = [].concat(updatedRequests);
                        if(lula.requests.length !== 0){
                            lulasocket.emit('updateRequest', {
                                curUser: lula,
                                request: lula.requests[0],
                                operation: 'accepted'
                            });
                        }
                        else{
                            lulasocket.on('updatedCurUserRooms', (updatedCurUserRooms)=>{
                                should(updatedCurUserRooms.length).equal(1);
                                done();
                            });
                        }
                    });
                });
            });
        });
    });
    it('should be able to deny a room request', (done)=>{
        milasocket.emit('joinApp', mila);
        milasocket.on('joinApp', (milaData)=>{
            mila = milaData;
            let lulasocket = io(BASE_URL, socketOptions);
            lulasocket.emit('joinApp', lula);
            lulasocket.on('joinApp', (lulaData)=>{
                lula = lulaData;
                let room = {
                    users: [mila, lula],
                    messages: []
                }
                milasocket.emit('enterRoom', {
                    selectedRoom: room,
                    userEntering: mila
                });
                milasocket.on('selectedRoom', (updatedSelectedRoom)=>{
                    room = updatedSelectedRoom;
                    milasocket.emit('newRequest', {
                        userFrom: mila,
                        userTo: lula,
                        selectedRoom: room
                    });
                    lulasocket.on('roomRequest', (updatedRequests)=>{
                        lula.requests = [].concat(updatedRequests);
                        if(lula.requests.length !== 0){
                            lulasocket.emit('updateRequest', {
                                curUser: lula,
                                request: lula.requests[0],
                                operation: 'denied'
                            });
                        }
                        else{
                            lulasocket.on('updatedCurUserRooms', (updatedCurUserRooms)=>{
                                should(updatedCurUserRooms.length).equal(0);
                                done();
                            });
                        }
                    });
                });
            });
        });
    });
    it('should be able to let a user send a message to a room', (done)=>{
        milasocket.emit('joinApp', mila);
        milasocket.on('joinApp', (milaData)=>{
            mila = milaData;
            let lulasocket = io(BASE_URL, socketOptions);
            lulasocket.emit('joinApp', lula);
            lulasocket.on('joinApp', (lulaData)=>{
                lula = lulaData;
                let room = {
                    users: [mila, lula],
                    messages: []
                }
                milasocket.emit('enterRoom', {
                    selectedRoom: room,
                    userEntering: mila
                });
                milasocket.on('selectedRoom', (updatedSelectedRoom)=>{
                    room = updatedSelectedRoom;
                    milasocket.on('newMsg', (updatedMessages)=>{
                        room.messages = updatedMessages;
                        if(updatedMessages.length === 1){
                            room.messages.push({
                                sentBy: mila,
                                content: 'new message',
                                dateSent: new Date()
                            });
                            milasocket.emit('sendMessage', room);
                            should(room.messages.length).equal(2);
                            done();
                        }
                    });
                });
            });
        });
    });
});

