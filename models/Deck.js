const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const Deck = mongoose.model("Deck", {
    deckName:String,
    deckDesc:String,
    deckImg:String,
    belong:ObjectId,
    cards: [{ front:String, back:String }]
})

module.exports = Deck
