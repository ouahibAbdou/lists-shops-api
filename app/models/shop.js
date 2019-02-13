import mongoose from 'mongoose'

let Schema = mongoose.Schema
let ShopSchema = new Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    category: { type: String, required: true },
    logo: { type: String, required: true },
    pictures: { type: String, default: [] },
    distance: { type: Number, required: true },
    created_at: { type: String, required: true }
}, { usePushEach: true })

module.exports = mongoose.model('Shop', ShopSchema)