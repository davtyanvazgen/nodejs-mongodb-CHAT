var mongo      = require("mongodb").MongoClient,
    url        = "mongodb://localhost:27017/mydb",
    app        = require("express")(),
    http       = require("http").Server(app),
    io         = require("socket.io")(http),
    bodyParser = require("body-parser"),
    mongoose   = require("mongoose"),
    Chat       = require("./chatModel.js");


mongoose.connect("mongodb://localhost:27017/mydb",{ useNewUrlParser: true });
app.use(bodyParser.urlencoded({ extended:true }));

http.listen(9494, function () {
    console.log("server has runing");
});

mongo.connect(url, { useNewUrlParser: true }, function(err,db){
    
    var dbo = db.db("mydb");
    var chats = dbo.collection("chats");
    
    // render show.ejs page
    app.get("/", function(req,res){
        //find and show all chats
        chats.find({}).toArray(function(err, result){
            if(err){
                throw err
            }else{
                res.render("./show.ejs", {result: result});
            }
        });  
        
    });


    //Socket.io logic
    io.on('connection', function(socket){
        
        // checking and creating new user
        socket.on("user name", function(userName){
            
            var newUser = {name: userName, sid: socket.id}
            chats.find({name:userName}).toArray(function(err, foundByName){
                var checkName;
                var checkSocketId = socket.id;               
                if(err){
                    throw err
                }else {
                    if(foundByName[0] === undefined){
                        Chat.create(newUser, function(err, result){
                            if(err){
                                throw err
                            } //else{
                            //     console.log(result);       
                            // }      
                        });
                        checkName = true
                    }else{
                        checkName = false;
                        console.log("same name")
                    }                  
                }
                io.emit("name", checkName, checkSocketId)
            });           
        });
        


        // add messages to DB
        socket.on("from input", function(msg){
            var date = new Date();
            var correctMinutes = date.getMinutes();
            if(correctMinutes < 10){
                correctMinutes = "0" + correctMinutes
            }
            var dateNow = date.getHours() + ":" + correctMinutes + " " + date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear()
            
            chats.find({sid: socket.id}).toArray(function(err, foundBySocketId){
                
                if(err){
                    throw err
                }else {  
                    Chat.create({name: foundBySocketId[0].name, 
                                text: msg, sid: foundBySocketId[0].sid,
                                date: dateNow}, 
                                function(err, newlycreated){
                        if(err){
                            throw err
                        }else{
                        //console.log(newlycreated);    
                        io.emit('to input', newlycreated);
                        }
                    });                  
                }              
            });
        });
    });          
});