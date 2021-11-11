const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const User = mongoose.model("User", {
  name: String,
  email: String,
  password: String,
  decks: [{ 
    deckId: ObjectId,
    deckName: String,
    deckImg: String
  }]
})

module.exports = User
