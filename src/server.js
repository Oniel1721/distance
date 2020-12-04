const express = require('express')
const formidable = require('express-formidable')
const path = require('path')
const morgan = require('morgan')
const cors = require('cors')
const haversine = require('haversine')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

const database = require('./database/handle_data.js')

app.set('port', process.env.PORT || 8000)


// middlewares
app.use(morgan('dev'))
app.use(formidable())

//routes
app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname,'./public/index.html'))
})

app.post('/new', (req, res)=>{
    console.log("en post new: ", req.fields)
    database.addNewUser(req.fields, (err, msg)=>{
        console.log("ya termine")
        res.json({err, msg})
    })
})

app.post('/login', (req, res)=>{
    console.log("en post new: ", req.fields)
    database.getUserByUserName(req.fields.username, (err, msg)=>{
        console.log("ya termine")
        res.json({err, msg})
    })
})

io.sockets.on("connection", (socket)=>{
    console.log("new user connected")
    socket.emit("givemeall")
    socket.on("takeall", (data)=>{
        socket.userdata = data
    })
    socket.on("reqUsers", (data)=>{
        socket.emit("givemeall")
        socket.emit('resUsers', database.openDB(true).users)
    })

    socket.on('reqUser', (username)=>{
        database.getUserByUserName(username, (err, msg, data)=>{
            let myCoords = {
                latitude: socket.userdata.latitude, 
                longitude: socket.userdata.longitude
            }
            let distance = haversine(myCoords, data)
            socket.emit('resUser', {
                err,
                msg,
                data,
                distance
            })
        })
    })
    
    socket.on('sendcall', (data)=>{
        database.getAllUsersInRadio(data.username, (err, msg, users)=>{
            if(!err){
                io.sockets.sockets.forEach(sock =>{
                    if(sock!=socket){
                        users.forEach(user=>{
                            if(user.user === sock.userdata.name){
                                sock.emit('getcall', {
                                    user: socket.userdata
                                })
                            }
                        })
                    }
                    console.log(sock === socket)
                })
                console.log(io.sockets === socket)
            }
            else{
                socket.emit("errorcall", {msg})
            }
        })
    })
})

// starting the server
server.listen(app.get('port'), (req, res)=>{
    console.log(`server on port ${app.get('port')}`)
})

