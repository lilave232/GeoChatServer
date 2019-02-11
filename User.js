// Constructor
var UsersMethod = Users.prototype;

function Users() {
    this.Users = [];
}

UsersMethod.addUser = function(Person) {
    this.Users.push(Person);
}

UsersMethod.deleteUser = function(Connection) {
    for (i = 0; i < this.Users.length; i++) {
        if (this.Users[i].connection == Connection) {
            this.Users.splice(i,1);
            return;
        }
    }
}

UsersMethod.isUserOnline = function(Username) {
    for (i = 0; i < this.Users.length; i++) {
        if (this.Users[i].username == Username) {
            return true;
        }
    }
    return false;
}

UsersMethod.getConnection = function(Username) {
    for (i = 0; i < this.Users.length; i++) {
        if (this.Users[i].username == Username) {
            return this.Users[i].connection;
        }
    }
}

UsersMethod.getUser = function(Username) {
    for (i = 0; i < this.Users.length; i++) {
        if (this.Users[i].username == Username) {
            return this.Users[i];
        }
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
}

ChatsMethod.deleteChat = function(chatID) {
    for (i = 0; i < this.Chats.length; i++) {
        if (this.Chats[i].chatID == chatID) {
            console.log(this.Chats.length)
            delete this.Chats.splice(i,1);
            console.log(this.Chats.length)
            return;
        }
    }
}

ChatsMethod.removeUserFromAll = function(Username) {
    for (i = 0; i < this.Chats.length; i++) {
        for (x = 0; x < this.Chats[i].Users.length; x++) {
            if (this.Chats[i].Users[x].username == Username) {
                console.log(this.Chats[i].Users.length)
                this.Chats[i].Users.splice(x,1);
                console.log(this.Chats[i].Users.length)
                console.log("User Removed")
                break;
            }
        }
    }
}

ChatsMethod.getChat = function(chatID) {
    for (i = 0; i < this.Chats.length; i++) {
        if (this.Chats[i].chatID == chatID) {
            return this.Chats[i];
        }
    }
    return false
}

var ChatMethod = Chat.prototype;

function Chat(chatID) {
    this.chatID = chatID;
    this.Users = [];
}

ChatMethod.addUser = function(User) {
    this.Users.push(User)
}

ChatMethod.deleteUser = function(Username) {
    for (i = 0; i < this.Users.length; i++) {
        if (this.Users[i].username == Username) {
            this.Users.splice(i,1);
            console.log("User Removed")
            break;
        }
    }
}

module.exports =   {
    Person,
    Users,
    Chats,
    Chat
}