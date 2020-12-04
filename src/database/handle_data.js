const fs = require('fs')
const path = require('path')
const haversine = require('haversine')

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

    getAllUsersInRadio(owner, cb){
        this.openDB()
        let closeUsers = []
        if(this.checkUserName(owner)){
            for (let user in this.currentData.users){
                if(user != owner){
                    console.log(`Distance between ${owner} and ${user}`)
                    let distance = haversine(this.currentData.users[owner],this.currentData.users[user]) 
                    console.log(distance)
                    if(distance <= 100) closeUsers.push({user, distance})
                    console.log("---------------------------")
                }
            }
            if(closeUsers.length){
                return cb(null, `${closeUsers.length} users founded.`, closeUsers)
            }
            return cb(true, "There are'nt any user in a radio of 100 km.")
        }
        return cb(true, "this user name does'nt exist in database.")
    }
}

const database = new DataBase()

module.exports = database