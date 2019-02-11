var Person = require("./User.js").Person;
var Users = require("./User.js").Users;
var Chats = require("./User.js").Chats;
var Chat = require("./User.js").Chat;
var Users = new Users();
var Chats = new Chats();
function StartServer(server) {
    var WebSocketServer = require('websocket').server;
    var http = require('http');
    wsServer = new WebSocketServer({
        httpServer: server,
            // You should not use autoAcceptConnections for production
            // applications, as it defeats all standard cross-origin protection
            // facilities built into the protocol and the browser.  You should
            // *always* verify the connection's origin and decide whether or not
            // to accept it.
        autoAcceptConnections: false
    });
          
    function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
    }
          
        
    wsServer.on('request', function(request) {
        if (!originIsAllowed(request.origin)) {
            // Make sure we only accept requests from an allowed origin
            request.reject();
            //console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
            return;
        }
    
    
        var connection = request.accept(null, request.origin);
        console.log((new Date()) + ' Connection accepted.');
        connection.on('message', function(message) {
            if (message.type === 'utf8') {
                let returnmess = JSON.parse(message.utf8Data);
                let type = returnmess["Type"];
                let Data = returnmess["Data"];
                //console.log(returnmess);
                handleMessages(type,Data,connection);
            }
        });
        connection.on('close', function(reasonCode, description) {
            Users.deleteUser(connection)
            console.log("User Left")
        });
    });
}
function handleMessages(type, data, connection) {
    switch(type){
        //User Connect
        case 0:
            Username = data["User"]["Username"]
            var User = new Person(Username,connection);
            Users.addUser(User);
            console.log("User " + Username + " Joined")
            break;
        //Message Send
        case 1:
            chatID = data["Message"]["chatID"]
            message = data["Message"]["message"]
            userFrom = data["Message"]["userFrom"]
            if (!Users.isUserOnline(userFrom)) {
                var User = new Person(userFrom,connection);
                Users.addUser(User);
                addUserToChat(chatID, Username)
            }
            var chat = Chats.getChat(chatID)
            for (x = 0; x < chat.Users.length; x++) {
                response = JSON.stringify({type:0,message:message,chatID:chatID,userFrom:userFrom});
                chat.Users[x].connection.sendUTF(response)
            }
            break;
        //User Viewing Chat
        case 2:
            chatID = data["Chat"]["chatID"]
            Username = data["Chat"]["Username"]
            if (!Users.isUserOnline(Username)) {
                var User = new Person(Username,connection);
                Users.addUser(User);
            }
            addUserToChat(chatID, Username)
            console.log(Chats.getChat(chatID))
            break;
        //User Left Chat
        case 3:
            chatID = data["Chat"]["chatID"]
            Username = data["Chat"]["Username"]
            if (Chats.getChat(chatID) != false) {
                Chats.getChat(chatID).deleteUser(Username)
                if (Chats.getChat(chatID).Users.length == 0) {
                    Chats.deleteChat(chatID)
                }
            }
            console.log(Chats)
            break;
        //Remove User From All Chats
        case 4:
            Username = data["Chat"]["Username"]
            console.log("User Leaving " + Username)
            Chats.removeUserFromAll(Username)
            for (x = 0; x < Chats.Chats.length; x++) {
                if (Chats.Chats[x].Users.length == 0) {
                    console.log("Deleting Chats")
                    Chats.deleteChat(Chats.Chats[x].chatID)
                }
            }
            console.log(Chats)
            break;
    }
}

function addUserToChat(chatID, Username) {
    var chat = null
    if (!Chats.getChat(chatID)) {
        console.log("Chat Does Not Exist")
        var chat = new Chat(chatID)
        User = Users.getUser(Username)
        chat.addUser(User)
        Chats.addChat(chat)
        console.log("Chat " + chatID + " Added")
    } else {
        console.log("Chat Exists")
        User = Users.getUser(Username)
        Chats.getChat(chatID).addUser(User)
    }
}

module.exports = {
    start: function (server) {StartServer(server)}
}