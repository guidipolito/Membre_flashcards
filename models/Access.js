const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const Access = mongoose.model("Access", {
    last_used: { type: Date },
    device: String,
    belong: ObjectId
})

module.exports = Access
