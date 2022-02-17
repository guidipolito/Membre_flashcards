require('dotenv').config()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const authRoute = require('express').Router()

//Credentials
const secret = process.env.SECRET
const secretRefresh = process.env.SECRET_REFRESH

//models
const Access = require('../models/Access')
const User = require('../models/User')

// Start - Register user
authRoute.post('/register', async(req, res) => {
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

  if( password !== confirmPassword ) return res.status(422).json({ error: "Passwords not equal" })

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
authRoute.post('/login', async(req, res) =>{
  const { email, password } = req.body
  const user = await User.findOne({ email: email })
  if( !user ) return res.status(422).json({ error:"User not found" })
  const passwordEqual = await bcrypt.compare(password, user.password)
  if( !passwordEqual )return res.status(422).json({ error:"Wrong password" })
  try{
    console.log("Gerando id do refresh token")
    refreshMadeAt = + new Date()
    const access = new Access({
      last_used: refreshMadeAt,
      device: req.headers['user-agent'],
      belong: user._id
    })
    refreshId = await access.save()
    const refreshToken = jwt.sign({ id: user._id, refreshId: refreshId._id, made_at: refreshMadeAt  }, secretRefresh )
    const token = jwt.sign({ id: user._id }, secret, { expiresIn: '0.5h' } )
    return res.status(200).json({ msg:"Logged in", refresh:refreshToken, token })
  }catch (error){
    console.log(error)
    return res.status(500).json({error:"We're having problems"})
  }
})
//End - Login User

//Refresh
authRoute.get('/refresh', async(req, res)=>{
  const auth = req.headers['authorization']
  const refreshHash = auth ? auth.split(' ')[1] : false

  if(!refreshHash)return res.status(401).json({ error: "I'm sorry, no access for you  https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Headers/Authorization  type: bearer "})
  try{
    refresh = await jwt.verify(refreshHash, secretRefresh )
    const dbToken = await Access.findOne({ _id: refresh.refreshId })
    if(!dbToken)return res.status(500).json({'error':'refresh not found'})
    // + before date type convert it to timestamp
    if( refresh.made_at != + dbToken.last_used ){
      await Access.deleteOne({ _id:refresh.refreshId })
      return res.status(400).json( {'error':'Refresh conflict'})
    }
    actualDate = + new Date()
    const newRefreshToken = jwt.sign({ id: refresh.id, refreshId: refresh.refreshId, made_at: actualDate  }, secretRefresh )
    await Access.updateOne({ _id: refresh.refreshId }, { last_used: actualDate })
    const token = jwt.sign({ id: refresh.id }, secret, { expiresIn: '0.5h' } )
    return res.status(200).json({ refresh: newRefreshToken, token })
  }catch(erro){
    console.log(erro)
    res.status(400).json({error: "Not valid token"})
  }
})

module.exports = authRoute

