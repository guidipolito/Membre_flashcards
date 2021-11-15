require('dotenv').config()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const authRoute = require('express').Router()

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
authRoute.post('/login', async(req, res) =>{
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

module.exports = authRoute
