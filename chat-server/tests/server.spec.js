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
let mila = {
    profilePic: {},
    username: 'Mila'
};

describe('Fabricate Chat Server', ()=>{
    let milasocket = null;
    beforeEach((done)=>{
        fabricate.init();
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
        milasocket.on('joinApp', (userData)=>{
            mila = userData;
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
});

