const mongoose = require('mongoose')

const Deck = mongoose.model("Deck", {
    deckName:String,
    deckDesc:String,
    deckImg:String
})

module.exports = Deck