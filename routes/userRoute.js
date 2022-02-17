const userRouter  = require("express").Router()

//Models
const User = require('../models/User')
const Deck = require('../models/Deck')


//Start of userRouter, all the userRouter routes are after api/user/
userRouter.get('/', async(req, res)=>{
  console.log(req.token)
  try{
    const user = await User.findOne({ _id:req.token.id }, { 'name':1, 'profilePicture':1, 'decks': 1 })
    res.status(200).json(user)
  }catch(error){
    console.log(error)
    res.status(500).json({'error':"Something bad happened while getting your data, I'm sorry for that"})
  }
})



//Start of create deck
userRouter.post('/deck', async(req, res)=>{
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

//Start of get deck
userRouter.get('/deck', async(req, res)=>{
  const { deckId } = req.body
  if(!deckId)return res.status(401).json({"error":"missing deckId"})
  try{
    const deck = await Deck.findOne({ _id: deckId, belong: req.token.id })
    res.status(200).json(deck)
  }catch(error){
    console.log(error)
    res.status(500).json({"error":"something bad happened"})
  }
})

//Start of remove deck
userRouter.delete('/deck', async(req, res)=>{
  const { deckId } = req.body
  console.log("Starting remove deck")
  if(deckId == 'undefined' )return res.status(422).json({error:"Missing Deck Id"})
  try{
    const deckBelong = await Deck.findOne({_id:deckId},{ "belong": 1 }) 
    //verify if exist before try "==", if you try with a null it's going to catch
    const isUsersDeck = deckBelong ? deckBelong.belong == req.token.id : false
    if( !isUsersDeck ) return res.status(401).json({ "error":"This deck doesn't exist or belong to you" })
    await Deck.remove({ _id:deckId })
    console.log("Starting removing from user")
      await User.updateOne({ _id: req.token.id }, { $pull: { decks: {_id: deckId } } })
    res.status(200).json({ "msg": "Ok" })
  }catch(error){
    console.log(error)
    res.status(500).json({'error':"Something really bad happened, hope nobody got injured"})
  }
})
//End of remove deck

//Start of create card
userRouter.post('/deck/card', async(req, res)=>{
  const { front, back, deckId } = req.body 
  
  if( !front && !back )return res.status(422).json({'error':'missing card data'})
  else if(!deckId) return res.status(422).json({'error':'missing deck id to insert card'})
  try{
    const test = await Deck.updateOne({ _id:deckId, belong:req.token.id }, { $addToSet: { cards: { front, back } } })
    console.log(test)
    res.status(200).json({'msg':'ok'})
  }catch(error){
    console.log(error)
    return res.status(500).json({ error:"We're having problems" })
  }
})
// end of create card


module.exports = userRouter
