import mongoose from 'mongoose'

let Schema = mongoose.Schema
let UserSchema = new Schema({
	info: {
		fullname: { type: String, required: true },
		phone: { type: String, required: true, unique: true },
		address: { type: String, required: true },
		preferred: { type: Array, default: [] },
		joined: { type: String, required: true }
	},
	credentials: {
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true }
	}
}, { usePushEach: true })

module.exports = mongoose.model('User', UserSchema)