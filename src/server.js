const express = require('express')
const formidable = require('express-formidable')
const path = require('path')
const morgan = require('morgan')
const cors = require('cors')
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

io.on("connection", (socket)=>{
    socket.on("reqUsers", ()=>{
        socket.emit('resUsers', database.openDB(true).users)
    })

    socket.on('reqUser', (username)=>{
        database.getUserByUserName(username, (err, msg, data)=>{
            socket.emit('resUser', {
                err,
                msg,
                data
            })
        })
    })
})

// starting the server
server.listen(app.get('port'), (req, res)=>{
    console.log(`server on port ${app.get('port')}`)
})

