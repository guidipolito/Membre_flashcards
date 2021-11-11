  //Dependencies
  require('dotenv').config()
  const express = require('express')
  const mongoose = require('mongoose')
  const bcrypt = require('bcrypt')
  const jwt = require('jsonwebtoken')
  const userRouter  = express.Router()
  const app = express()

  //Credentials
  const secret = process.env.SECRET
  const dbUser = process.env.DB_USER
  const dbPass = process.env.DB_PASS
  const dbURI = `mongodb+srv://${dbUser}:${dbPass}@membredb.s67my.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

  //Middlewares
  app.use(express.json())
  app.use('/api/user', userRouter)
  userRouter.use(tokenValidate)

  function tokenValidate(req, res, next){
    const auth = req.headers['authorization']
    const token = auth.split(' ')[1]

    if(!token)return res.status(401).json({ error: "I'm sorry, no acess for you"})
    try{
      req.token = jwt.verify(token, secret)
      next()
    }catch(erro){
      res.status(400).json({error: "Fake Token"})
    }
  }

  //Models
  const User = require('./models/User')
  const Deck = require('./models/Deck')

  app.get("/", (req, res)=>{
    res.status(200).json({
      msg:"Bem vindo"
    });
  })

  userRouter.get('/', async(req, res)=>{
    console.log(req.token)
    const user = await User.findOne({ _id:req.token.id }, { 'name':1, 'profile':1, 'decks': 1 })
    res.status(200).json(user)
  })



//Start of create deck
userRouter.post('/createDeck', async(req, res)=>{
  console.log("Criando deck para user "+req.token.id)
  const { deckName, deckDesc, deckImg } = req.body
  
  if( typeof(deckName ) == 'undefined' ) return res.status(422).json({erro:"missing deck name"})
  let deck = { 
    deckName: deckName,
    belong: req.token.id
  }
  if( deckDesc ) deck["deckDesc"] = deckDesc
  if( deckImg ) deck["deckImg"] = deckImg
    console.log(deck)
  const deckModel = new Deck(deck)
  try {
    const verifyExist = await Deck.findOne({
      deckName: deck.deckName, 
      belong: deck.belong
    })
    console.log("Existe?")
    console.log(verifyExist)
    if(verifyExist) res.status(422).json({ erro:"You already have this deck"})
    else{
      const deckStatus = await deckModel.save()
      deck["_id"] = deckStatus._id
      await User.updateOne({ _id:req.token.id }, { $addToSet: { decks: deck }})  
      res.status(200).json({msg:"Deck created"})
    }
  } catch (error) {
    res.status(500).json({erro:"Not able to create deck"})
  }
})
//End of create deck



// Start - Register user
app.post('/auth/register', async(req, res) => {
  const { name, email, password, confirmPassword } = req.body

  if(!name || !email || !password || !confirmPassword ){
    return res.status(422).json({
      error:'Missing information!',
      dataStatus: {
        name: name ? "ok" : "missing",
        email: email ? "ok" : "missing",
        password: password ? "ok" : "missing",
        confirmPassword: confirmPassword ? "ok" : "missing"
      }
    })
  }

  if( password !== confirmPassword ) return res.status(422).json({ error: "Passwords and confirm not equal" })

  const userExist = await User.findOne({ email: email })
  if( userExist ) return res.status(422).json({ error: "Email already in use"} )

  salt = await bcrypt.genSalt(12)
  digestedPass = await bcrypt.hash(password, salt)

  const user = new User({
    name,
    email,
    password: digestedPass
  })

  try{
    const userRegister = await user.save()
    console.log(userRegister)
    return res.status(200).json({ msg:"Register made" })
  }catch (error){
    console.log(error)
    return res.status(500).json({ error:"We're having problems" })
  }
})
// End - Register User

//Start - Login User
app.post('/auth/login', async(req, res) =>{
  const { email, password } = req.body
  const user = await User.findOne({ email: email })
  if( !user ) return res.status(422).json({ error:"User not found" })
  const passwordEqual = await bcrypt.compare(password, user.password)
  if( !passwordEqual )return res.status(422).json({ error:"Wrong password" })
  try{
    const token = jwt.sign({ id: user._id }, secret )
    return res.status(200).json({ msg:"Logged in", token:token })
  }catch (error){
    console.log(error)
    return res.status(500).json({error:"We're having problems"})
  }
})
//End - Login User

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
