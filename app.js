    //Dependencies
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const jwt = require('jsonwebtoken')
const path = require('path')
port = 4001

//Credentials
const dbUser = process.env.DB_USER
const dbPass = process.env.DB_PASS
const dbURI = `mongodb+srv://${dbUser}:${dbPass}@membredb.s67my.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
const secret = process.env.SECRET

//Routes
const authRoute = require('./routes/auth')
const userRouter = require('./routes/userRoute')


//Middlewares
app.use(express.json())
app.use('/api/user', tokenValidate)
app.use('/api/user', userRouter)
app.use('/auth', authRoute)
//app.use('/app', express.static(path.join(__dirname, '../front/build')))
app.use('/public', express.static(path.join(__dirname, '/public')))

function tokenValidate(req, res, next){
  const auth = req.headers['authorization']
  const token = auth ? auth.split(' ')[1] : false
  if(!token)return res.status(401).json({ error: "I'm sorry, no access for you  https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Headers/Authorization  type: bearer "})
  try{
    console.log(token)
    req.token = jwt.verify(token, secret)
    next()
  }catch(erro){
    res.status(400).json({error: "Fake Token"})
  }
}


app.get("/", (req, res)=>{
  console.log(req)
  res.status(200).json({
    msg:"Work in progress"
  });
})
//End request /


//Connect part
mongoose
  .connect(dbURI)
  .then(
    ()=>{
      app.listen(port, function(){
        console.log(`⚙ Paying attention to requests, port: ${port} ⚙`)
      })
    }
  )
  .catch(
    err => console.log(err)
  )
