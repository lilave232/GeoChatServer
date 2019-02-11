var express = require('express');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var mysql = require('mysql');
var apn = require('apn');
var WebSocketServer = require('websocket').server;
var http = require('http');
const uuidv4 = require('uuid/v4')
var _connections = [];
var _users = [];
var _address = [];
var _username = [];
var UsersIndex = 0;
// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var app = express();

// This responds a POST request for the homepage
app.post('/LogIn',urlencodedParser, async function (req, res) {
    var response = ""
    response = await Login(req);
    console.log(response);
    res.send(response);
})

app.post('/Register',urlencodedParser, async function (req, res) {
  var response = ""
  response = await Register(req);
  res.send(response);
})

app.post('/UpdateLocation',urlencodedParser, async function (req, res) {
  var response = ""
  response = await UpdateLocation(req);
  res.send(response);
})

app.post('/CreateChat',urlencodedParser, async function (req, res) {
  var response = ""
  response = await CreateChat(req);
  res.send(response);
})

app.post('/GetMapChats',urlencodedParser, async function (req, res) {
  var response = ""
  response = await getAllMapChats(req);
  res.send(response);
})

var server = app.listen(8081, '0.0.0.0', function () {

    var host = server.address().address
    var port = server.address().port
    /*var Person = require("./User.js").Person;
    var Users = require("./User.js").Users;
    var Users = new Users();
    var User = new Person("avery","pozzobon","averypozzobon@gmail.com","lilave232","11221122112211")
    Users.addUser(User);
    console.log(Users);*/
    //Person.addUser("avery","pozzobon","averypozzobon@gmail.com","lilave232","11221122112211");
    console.log("Example app listening at http://%s:%s", host, port)
});
var SocketServer = require("./SocketServer.js");
SocketServer.start(server);

var UpdateLocation = function(req) {
  return new Promise(function(resolve, reject) {
    var con = mysql.createConnection({
        host: "localhost",
        user: "lilave232",
        password: "Quinn123!",
        database: "GeoChat"
      });
    //UPDATE `GeoChat`.`Users` SET `Longitude` = '-80.53403359682538', `Latitude` = '43.474176473396845' WHERE (`Username` = 'lilave232');
    let Username = req.body.Username;
    let Longitude = req.body.Longitude;
    let Latitude = req.body.Latitude
    var response = ""
    con.connect(function(err) {
        if (err) throw err;
        /*Select all customers where the address starts with an "S":*/
        console.log("Updated " + Username + " Location")
        con.query("UPDATE Users SET `Longitude`=" + mysql.escape(Longitude) + ", Latitude=" + mysql.escape(Latitude) + " WHERE (`Username` = '" + Username + "');", function (err, result, fields) {
          if (err) {
            response = JSON.stringify({error:true,Title:"Failure",message:"This username or password is incorrect!"});
            con.end();
            resolve(response);
            throw err;
          }
          else {
            response = JSON.stringify({error:false,Title:"Success",message:"Location updated"});
            con.end();
            resolve(response);
          }
        }); 
    });
  });
}

var getAllMapChats = function(req) {
  return new Promise(function(resolve, reject) {
    var con = mysql.createConnection({
        host: "localhost",
        user: "lilave232",
        password: "Quinn123!",
        database: "GeoChat"
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
        let Longitude = req.body.Longitude
        let Latitude = req.body.Latitude

        //
        con.query("SELECT * FROM `ChatsID` WHERE IFNULL((1000*6371*ACOS((SIN(RADIANS(" + Latitude + ")) * SIN(RADIANS(`Latitude`))) + (COS(RADIANS(" + Latitude + ")) * COS(RADIANS(`Latitude`)) * COS(RADIANS(`Longitude`) - RADIANS(" + Longitude + "))))),0) < 1000;", function (err, result, fields) {
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
                response = JSON.stringify({error:false,Title:"Success",chats:result});
                con.end();
                resolve(response);
              //});
            }
            else {
                response = JSON.stringify({error:true,Title:"Failure",message:"No Chats to Load!"});
                con.end();
                resolve(response);
            }
          }
        }); 
    });
  });
}

var CreateChat = function(req) {
  return new Promise(function(resolve, reject) {
    var con = mysql.createConnection({
        host: "localhost",
        user: "lilave232",
        password: "Quinn123!",
        database: "GeoChat"
      });
    //INSERT INTO `GeoChat`.`ChatsID`(`chat_id`,`chat_name`,`username`,`created_at`,`Longitude`,`Latitude`,`Private`,`Image`)VALUES(<{chat_id: }>,<{chat_name: }>,<{username: }>,<{created_at: CURRENT_TIMESTAMP}>,<{Longitude: }>,<{Latitude: }>,<{Private: 0}>,<{Image: Yellow}>);
    //CREATE TABLE `" + chat_id + "` (`message_ID` int NOT NULL AUTO_INCREMENT,`userFrom` varchar(100) NOT NULL, `message` LongText, `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`message_ID`))
    let Chat_ID = uuidv4();
    let Name = mysql.escape(req.body.Name);
    let Username = mysql.escape(req.body.Username);
    let Longitude = mysql.escape(req.body.Longitude);
    let Latitude = mysql.escape(req.body.Latitude);
    let Private = mysql.escape(req.body.Private);
    let Image = mysql.escape(req.body.Image);
    var response = ""
    con.connect(function(err) {
        if (err) throw err;
        /*Select all customers where the address starts with an "S":*/
        con.query("INSERT INTO `ChatsID`(`chat_id`,`chat_name`,`username`,`Longitude`,`Latitude`,`Private`,`Image`)VALUES(" + mysql.escape(Chat_ID) +"," + Name + "," + Username + ", " + Longitude + ", " + Latitude + ", " + Private + ", " + Image + ");", function (err, result, fields) {
          if (err) {
            response = JSON.stringify({error:true,Title:"Failure",message:"Could not add chat to Chat ID"});
            con.end();
            resolve(response);
            throw err;
          }
          else {
              con.end();
              console.log("Created Chat " + Chat_ID + " For " + Username)
              response = JSON.stringify({error:false,Title:"Success",message:"Chat Updated"});
              resolve(response);
            }
        }); 
    });
  });
}

var Login = function(req) {
  return new Promise(function(resolve, reject) {
    var con = mysql.createConnection({
        host: "localhost",
        user: "lilave232",
        password: "Quinn123!",
        database: "GeoChat"
      });
   // Prepare output in JSON format
    /*response = {
        first_name:req.body.first_name,
        last_name:req.body.last_name
    };*/
    let Password = crypto.createHash('md5').update(req.body.Password).digest("hex");
    let Username = req.body.Username;
    let Token = req.body.Token;
    var response = ""
    con.connect(function(err) {
        if (err) throw err;
        /*Select all customers where the address starts with an "S":*/
        con.query("SELECT * FROM Users WHERE Username=" + mysql.escape(Username) + "AND Password=" + mysql.escape(Password), function (err, result, fields) {
          if (err) throw err;
          if (result.length > 0)
          {
            //var sql = "UPDATE Users SET Token = " + mysql.escape(Token) + " WHERE Username = " + mysql.escape(Username) + "";
            //  con.query(sql, function (err, result1) {
            //  if (err) throw err;
              response = JSON.stringify({error:false,Title:"Success",user:result[0]});
              con.end();
              resolve(response);
            //});
          }
          else {
              response = JSON.stringify({error:true,Title:"Failure",message:"This username or password is incorrect!"});
              con.end();
              resolve(response);
          }
        }); 
    });
  });
}

var Register = function(req)  {
    return new Promise(function(resolve, reject) {
      var con = mysql.createConnection({
          host: "localhost",
          user: "lilave232",
          password: "Quinn123!",
          database: "GeoChat"
        });
     // Prepare output in JSON format
      /*response = {
          first_name:req.body.first_name,
          last_name:req.body.last_name
      };*/
      let Password = mysql.escape(crypto.createHash('md5').update(req.body.Password).digest("hex"));
      let Username = mysql.escape(req.body.Username);
      let Token = mysql.escape(req.body.Token);
      var response = ""
      con.connect(function(err) {
          if (err) throw err;
          /*Select all customers where the address starts with an "S":*/
          con.query("INSERT INTO Users (`Username`,`Password`) VALUES (" + Username + ", " + Password + ")", function (err, result, fields) {
            if (err) {
              if (err.code == "ER_DUP_ENTRY") {
                response = JSON.stringify({error:true,Title:"Failure",message:"This username is taken!!"});
                con.end();
                resolve(response);
              } else {
                response = JSON.stringify({error:true,Title:"Failure",message:"An error has occured!!"});
                con.end();
                resolve(response);
              }
            } else {
              con.query("SELECT * FROM Users WHERE Username=" + Username, function (err, result, fields) {
                if (err) throw err;
                if (result.length > 0)
                {
                  console.log(result[0]);
                  response = JSON.stringify({error:false,Title:"Success",message:"Successfully Registered!!"});
                  table_username = Username.substring(1,Username.length-1)
                  con.query(create_friends_table = "CREATE TABLE `GeoChat`.`" + table_username + "_Friends` (`index` INT NOT NULL AUTO_INCREMENT,`username` VARCHAR(255) NULL,PRIMARY KEY (`index`),UNIQUE INDEX `Username_UNIQUE` (`Username` ASC) VISIBLE);");
                  con.end();
                  resolve(response);
                }
                else {
                  response = JSON.stringify({error:true,Title:"Failure",message:"User could not be registered!!"});
                  con.end();
                  resolve(response);
                }
              });
            }
          });
      });
    });
  }