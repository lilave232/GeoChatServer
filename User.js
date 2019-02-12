// Constructor
var UsersMethod = Users.prototype;

function Users() {
    this.Users = [];
}

UsersMethod.addUser = function(Person) {
    this.Users.push(Person);
    console.log("User " + Person.username + " Joined")
}

UsersMethod.deleteUser = function(Connection) {
    var picked = this.Users.findIndex(x => x.connection == Connection)
    if (picked != -1) {
        this.Users.splice(picked,1);
        console.log("User Left")
    }
}

UsersMethod.isUserOnline = function(Username) {
    var picked = this.Users.find(x => x.username == Username)
    if (picked == undefined) {
        return false
    } else {
        return true
    }
}

UsersMethod.getConnection = function(Username) {
    var picked = this.Users.find(x => x.username == Username)
    if (picked == undefined) {
        return false
    } else {
        return picked.connection
    }
}

UsersMethod.getUser = function(Username) {
    var picked = this.Users.find(x => x.username == Username)
    if (picked == undefined) {
        return false
    } else {
        return picked
    }
}

UsersMethod.getSize = function() {
    return this.Users.length;
}

var PersonMethod = Person.prototype;

function Person(username, connection) {
    // always initialize all instance properties
    this.username = username;
    this.connection = connection;
}

var ChatsMethod = Chats.prototype;

function Chats() {
    this.Chats = [];
}

ChatsMethod.addChat = function(Chat) {
    this.Chats.push(Chat);
    console.log("Chat " + Chat.chatID + " Added")
}

ChatsMethod.deleteChat = function(chatID) {
    let picked = this.Chats.findIndex(x => x.chatID == chatID)
    if (picked == -1) {

    } else {
        this.Chats.splice(picked,1);
        console.log("Chat Deleted")
    }
}

ChatsMethod.removeUserFromAll = function(Username) {
    for (x = 0; x < this.Chats.length; x++) {
        let y = this.Chats[x].Users.findIndex(y => y.username == Username)
        if (y == -1) {

        } else {
            this.Chats[x].Users.splice(y,1);
            console.log("User Removed From " + this.Chats[x].chatID)
        }
    }
}

ChatsMethod.getChat = function(chatID) {
    var picked = this.Chats.find (x => x.chatID === chatID);
    if (picked == undefined) {
        return false
    } else {
        return picked
    }
}

var ChatMethod = Chat.prototype;

function Chat(chatID) {
    this.chatID = chatID;
    this.Users = [];
}

ChatMethod.addUser = function(User) {
    this.Users.push(User)
    var names = this.Users.map(function(item) {
        return item.username;
    });
    console.log("User Added To Chat")
    console.log("Chat: " + this.chatID + " Users: " + names)
}

ChatMethod.deleteUser = function(Username) {
    var picked = this.Users.findIndex (x => x.username === Username);
    if (picked == -1) {
        return false
    } else {
        this.Users.splice(picked,1);
        console.log("User Removed")
    }
}

module.exports =   {
    Person,
    Users,
    Chats,
    Chat
}