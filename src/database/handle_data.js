const fs = require('fs')
const path = require('path')

class DataBase{
    constructor(){
        this.url = path.join(__dirname, './database.json')
        this.currentData = JSON.parse(fs.readFileSync(this.url))
    }


    openDB(val){
        this.currentData = JSON.parse(fs.readFileSync(this.url))
        if(val) return this.currentData
    }

    saveDB(){
        fs.writeFileSync(this.url, JSON.stringify(this.currentData))
    }

    checkUserName(username){
        this.openDB()
        if(this.currentData.users[username]){
            return true
        }
        return false
    }

    addNewUser(data, cb){
        this.openDB()
        const {username, latitude, longitude} = data
        if(!this.checkUserName(username)){
            this.currentData.users[username] = {
                latitude,
                longitude
            }
            this.saveDB()
            return cb(null, `${username}: has been saved.`)
        }
        else{
            return cb(true, `${username}: is already used.`)
        }
    }

    getUserByUserName(username, cb){
        this.openDB()
        if(this.checkUserName(username)){
            return cb(null, `${username}: founded.`,this.currentData.users[username])
        }
        return cb(true, `${username}: not found.`, null)
    }
}

const database = new DataBase()

module.exports = database