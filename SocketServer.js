var Person = require("./User.js").Person;
var Users = require("./User.js").Users;
var Chats = require("./User.js").Chats;
var Chat = require("./User.js").Chat;
var credentials = require("./credentials.js")
var mysql = require('mysql');
var moment = require('moment-timezone');
var Users = new Users();
var Chats = new Chats();
var apn = require('apn');
var options = {
    token: {
      key: credentials.notification_key,
      keyId: credentials.notification_key_id,
      teamId: credentials.notification_team_id
    },
    production: false
  };
var apnProvider = new apn.Provider(options);
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
        });
    });
}
async function handleMessages(type, data, connection) {
    switch(type){
        //User Connect
        case 0:
            Username = data["User"]["Username"]
            var User = new Person(Username,connection);
            Users.addUser(User);
            break;
        //Message Send
        case 1:
            chatID = data["Message"]["chatID"]
            message = data["Message"]["message"]
            userFrom = data["Message"]["userFrom"]
            colorBack = data["Message"]["colorBack"]
            colorFront = data["Message"]["colorFront"]
            addMessageToChat(chatID, message, userFrom, colorBack, colorFront)
            if (!Users.isUserOnline(userFrom)) {
                var User = new Person(userFrom,connection);
                Users.addUser(User);
                addUserToChat(chatID, Username)
            }
            var chat = Chats.getChat(chatID)
            for (x = 0; x < chat.Users.length; x++) {
                response = JSON.stringify({type:0,message:message,chatID:chatID,userFrom:userFrom,colorBack:colorBack,colorFront:colorFront});
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
        //Message Send With Notification
        case 5:
            chatID = data["Message"]["chatID"]
            message = data["Message"]["message"]
            userFrom = data["Message"]["userFrom"]
            colorBack = data["Message"]["colorBack"]
            colorFront = data["Message"]["colorFront"]
            chatTitle = data["Message"]["chatTitle"]
            addMessageToChat(chatID, message, userFrom, colorBack, colorFront)
            if (!Users.isUserOnline(userFrom)) {
                var User = new Person(userFrom,connection);
                Users.addUser(User);
                addUserToChat(chatID, Username)
            }
            var chat = Chats.getChat(chatID)
            for (x = 0; x < chat.Users.length; x++) {
                response = JSON.stringify({type:0,message:message,chatID:chatID,userFrom:userFrom,colorBack:colorBack,colorFront:colorFront});
                chat.Users[x].connection.sendUTF(response)
            }
            console.log("chatTitle")
            members = await getMembers(chatID,userFrom)
            var i = 0
            for (i = 0; i < members.length; i++)
            {
                console.log(members[i]["Token"])
                payload = {'storyboardID': "Chat", 'viewInTabBar': 2, 'chatID': chatID, 'chatTitle':chatTitle}
                sendNotification(members[i]["Token"],"✉️ " + userFrom, message, payload)
            }
            break;
    }
}

function addMessageToChat(chatID, message, userFrom, colorBack, colorFront) {
    var con = mysql.createConnection({
        host: credentials.host,
        user: credentials.username,
        password: credentials.password,
        database: credentials.database
        });
    // Prepare output in JSON format
    /*response = {
        first_name:req.body.first_name,
        last_name:req.body.last_name
    };*/
    time = getDateEST()
    con.connect(function(err) {
        if (err) throw err;
        /*Select all customers where the address starts with an "S":*/
        //INSERT INTO `Chats`(chatID`,`userFrom`,`message`,`color`) VALUES(chatID,userFrom,message,color);

        //
        con.query("INSERT INTO `Chats` (`chatID`,`userFrom`,`message`,`colorBack`, `colorFront`, `time`) VALUES(" +mysql.escape(chatID) + ", " + mysql.escape(userFrom) + ", " + mysql.escape(message) + ", " + colorBack + ", " + colorFront + ", " + mysql.escape(time) + ");", function (err, result, fields) {
            if (err) {
            console.log(err)
            } else {
            console.log("Message Added To Chat")
            alterChatsIDTable(chatID, message, userFrom, time)
            }
        }); 
    });
}
var getMembers = function(chatID, Username) {
    return new Promise(function(resolve, reject) {
      var con = mysql.createConnection({
          host: credentials.host,
          user: credentials.username,
          password: credentials.password,
          database: credentials.database
        });
     // Prepare output in JSON format
      /*response = {
          first_name:req.body.first_name,
          last_name:req.body.last_name
      };*/
      var response = ""
      con.connect(function(err) {
          if (err) throw err;
          /*Select all customers where the address starts with an "S":*/
  
          // 
          con.query("SELECT GeoChat.Users.Token FROM GeoChat.Subscribed INNER JOIN GeoChat.Users ON GeoChat.Subscribed.member=GeoChat.Users.Username WHERE `chatID`=" + mysql.escape(chatID) + " AND `member`!=" + mysql.escape(Username) + ";", function (err, result, fields) {
            if (err) {
              console.log(err)
              response = JSON.stringify({error:true,Title:"Failure",message:"No Chats to Load!"});
              con.end();
              resolve(response);
            } else {
                if (result.length > 0)
                {
                    //var sql = "UPDATE Users SET Token = " + mysql.escape(Token) + " WHERE Username = " + mysql.escape(Username) + "";
                    //  con.query(sql, function (err, result1) {
                    //  if (err) throw err;
                    response = result
                    con.end();
                    resolve(response);
                    //});
                }
            }
          }); 
      });
    });
  }
function getDateEST() {
    var d = new Date();
    var myTimezone = "America/Toronto";
    var myDatetimeFormat= "YYYY-MM-DD HH:mm:ss";
    var myDatetimeString = moment(d).tz(myTimezone).format(myDatetimeFormat);
    return myDatetimeString
  }

function alterChatsIDTable(chatID, message, userFrom, time) {
    //UPDATE `GeoChat`.`ChatsID` SET `Latest_Message`='Hello', `Sent_By`='lilave232', `Time_Of_Message` = NOW() WHERE (`chat_id` = '3b8331e3-c0cb-4c8e-85ef-35eefdd7b115');
    var con = mysql.createConnection({
        host: credentials.host,
        user: credentials.username,
        password: credentials.password,
        database: credentials.database
        });
    // Prepare output in JSON format
    /*response = {
        first_name:req.body.first_name,
        last_name:req.body.last_name
    };*/
    con.connect(function(err) {
        if (err) throw err;
        /*Select all customers where the address starts with an "S":*/
        //INSERT INTO `Chats`(chatID`,`userFrom`,`message`,`color`) VALUES(chatID,userFrom,message,color);

        //
        con.query("UPDATE `ChatsID` SET `Latest_Message`=" + mysql.escape(message) + ", `Sent_By`=" + mysql.escape(userFrom) + ", `Time_Of_Message` =" + mysql.escape(time) + " WHERE (`chat_id` = " + mysql.escape(chatID) + ");", function (err, result, fields) {
            if (err) {
            console.log(err)
            } else {
            console.log("Message Added To Chat")
            }
        }); 
    });
}

function addUserToChat(chatID, Username) {
    var chat = null
    if (!Chats.getChat(chatID)) {
        console.log("Chat Does Not Exist")
        var chat = new Chat(chatID)
        User = Users.getUser(Username)
        chat.addUser(User)
        Chats.addChat(chat)
    } else {
        console.log("Chat Exists")
        User = Users.getUser(Username)
        Chats.getChat(chatID).addUser(User)
    }
}

function sendNotification(deviceToken,title, message, payload) {
    var note = new apn.Notification();
    note.badge = 1;
    note.sound = "ping.aiff";
    note.title = title
    note.body = message;
    note.payload = payload;
    note.topic = "veriplat.GeoChat";
    apnProvider.send(note, deviceToken).then( (result) => {
      // see documentation for an explanation of result
    });
  }

module.exports = {
    start: function (server) {StartServer(server)}
}