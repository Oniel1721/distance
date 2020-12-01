const express = require('express')
const formidable = require('express-formidable')
const path = require('path')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)


app.use(morgan('dev'))


app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname,'./public/index.html'))
})

server.listen(8000, (req, res)=>{
    console.log(`server on port 8000`)
})

