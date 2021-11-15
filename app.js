//Dependencies
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const app = express()

//Credentials
const dbUser = process.env.DB_USER
const dbPass = process.env.DB_PASS
const dbURI = `mongodb+srv://${dbUser}:${dbPass}@membredb.s67my.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

//Routes
const authRoute = require('./routes/auth')
const userRouter = require('./routes/userRoute')


//Middlewares
app.use(express.json())
app.use('/api/user', userRouter)
app.use('/auth', authRoute)
userRouter.use(tokenValidate)

function tokenValidate(req, res, next){
  const auth = req.headers['authorization']
  const token = auth ? auth.split(' ')[1] : false

  if(!token)return res.status(401).json({ error: "I'm sorry, no access for you  https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Headers/Authorization  type: bearer "})
  try{
    req.token = jwt.verify(token, secret)
    next()
  }catch(erro){
    res.status(400).json({error: "Fake Token"})
  }
}


//Start request /
app.get("/", (req, res)=>{
  console.log(req)
  res.status(200).json({
    msg:"Bem vindo"
  });
})
//End request /


  //Connect part
mongoose
  .connect(dbURI)
  .then(
    ()=>{
      app.listen(3000, function(){
        console.log("⚙ Paying attention to requests ⚙")
      })
    }
  )
  .catch(
    err => console.log(err)
  )
