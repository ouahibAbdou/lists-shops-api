import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

/* Desining CLI Packages */
/* To build a beautiful command line interfaces  */
import clear from 'clear'
import chalk from 'chalk'

/* In config.js you will find some informations like dns, mongodb server... */
import { dns, db, secret, flatit, timeit, errors } from './app/config'

import User from './app/models/user'
import Shop from './app/models/shop'

/* Expressjs configuration */
const app = express()
const port = process.env.PORT || 2000
const Router = express.Router()

app.set('superSecret', secret)
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())
app.use(morgan('dev'))
app.use('/api', Router)
/* Middleware to authenticate and check token */
Router.use((req, res, next) => {

    let token = req.body.token || req.param.token || req.headers['x-access-token']

    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, app.get('superSecret'), (err, decoded) => {
            if (err) {
                res.status(errors[401].code);
                return res.json(errors[401])
            } else {
                req.decoded = decoded
                next()
            }
        })

    } else { return res.status(errors[403].code).send(errors[403]) }

})

/* This Route to check if user exists or not */
app.post('/authenticate', (req, res) => {

    // Find User
    User.findOne({
        'credentials.email': req.body.email
    }, (err, user) => {

        if (err) throw err

        if (!user) {
            res.status(errors[401].code);
            res.json(errors[401])
        } else if (user) {

            // check if password 

            if (bcrypt.compareSync(req.body.password, user.credentials.password) === false) {
                res.status(errors[401].code)
                res.json(errors[401])
            } else {

                let payload = {
                    status: true,
                    user: {
                        fullname: user.info.fullname,
                        logged: true
                    }
                }
                const expiresIn = parseFloat(req.body.expires_in) > 0 ? parseFloat(req.body.expires_in) * 3600 : 86400
                const token = jwt.sign(payload, app.get('superSecret'), { expiresIn })

                res.json({
                    status: true,
                    message: 'Enjoy your token!',
                    token: token,
                    user
                })
            }

        }

    })
})




/* SignUp Route */
app.post('/new/user', (req, res) => {

    const newUser = {
        info: {
            fullname: req.body.fname,
            phone: req.body.phone,
            address: req.body.address,
            joined: timeit()
        },
        credentials: {
            email: req.body.email,
            password: req.body.password
        }
    }

    /* Validate these inputs */
    newUser_values = Object.values(newUser.info)

    newUser_values.push(...Object.values(newUser.credentials))

    if (newUser_values.includes('') || newUser_values.includes(undefined)) {
        res.status(errors[422].code)
        res.json(errors[422])
    }
    else {
        newUser.credentials.password = bcrypt.hashSync(req.body.crawler_password, bcrypt.genSaltSync(9))
        new User(newUser).save((err) => {
            if (err) throw err
            res.json({ code: 200, status: true, message: 'New user saved.', created_at: timeit() })
        })
    }
})

/*  Sorted Shops Route */
Router.get('/shops/:sorted', (req, res) => { // sorted variable can be ascending or descending

    switch (req.params.sorted) {
        case 'ascending':
            Shop.find({}).sort({ distance: 'ascending' }).exec(function (err, docs) {
                res.json(docs)
            });
            break;

        default:
            Shop.find({}).sort({ distance: 'descending' }).exec(function (err, docs) {
                res.json(docs)
            });
            break;
    }

})

/* Like Shop Route */
Router.put('/user/:uid/like/:sid', (req, res) => {

    User.findById(req.params.uid, (err, user) => {
        if (err) throw err

        if (user !== null) {

            user.info.preferred.push(req.params.sid)

            user.save((err) => {
                if (err) throw err;
                res.json({ code: 200, status: true, message: 'shop added to preferred shops.', created_at: timeit() })
            });
        }
        else {
            res.json({ code: 200, status: true, message: 'User not found.', created_at: timeit() })
        }
    })

})


/* Dislike Shop Route */
Router.put('/user/:uid/dislike/:sid', (req, res) => {

    User.findById(req.params.uid, (err, user) => {
        if (err) throw err

        if (user !== null) {

            if (user.info.preferred.includes(req.params.sid)) {
                if (user.info.preferred.indexOf(req.params.sid) > -1) {
                    user.info.preferred.splice(user.info.preferred.indexOf(req.params.sid), 1);
                }
            }

            user.save((err) => {
                if (err) throw err;
                res.json({ code: 200, status: true, message: 'shop removed from preferred shops.', created_at: timeit() })
            });
        }
        else {
            res.json({ code: 200, status: true, message: 'User not found.', created_at: timeit() })
        }
    })

})

/* If You Want To Create a user or a shop for test*/
/*
const wahib = {
    info: {
        fullname: 'Wahib Abdou',
        phone: '+21268188797',
        address: 'Meknes El Bassatine 7',
        joined: timeit()
    },
    credentials: {
        email: 'wahibworks@gmail.com',
        password: bcrypt.hashSync("bhxx.abdou.19", bcrypt.genSaltSync(9))
    }
}

const decathlon = {
    name: 'Decathlon',
    description: 'Decathlon S.A. is a French sporting goods retailer. With over 1500 stores in 49 countries, it is the largest sporting goods retailer in the world. ',
    address: 'Decathlon Meknès, Route de Agouray, Meknès 50050',
    category: 'sports',
    logo: 'https://rakutenmarketing.com/wp-content/uploads/2017/07/new-decathlon.jpg',
    pictures: ['https://www.infomediaire.net/wp-content/uploads/2017/05/decathlon.jpg', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeFKAC-0lLbHd0eLjFS0uwuf9wb3SboQg64mANyAAWjLei3JZk', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBQVbI6j7x0MBpb-AemPpsf2PNiULPkbPDhQV7ncNKljvThSnb'],
    distance: 15,
    created_at: timeit()
}

new Shop(decathlon).save(function (err) {
    if (err) throw err
})

new User(wahib).save(function (err) {
    if (err) throw err

})
*/

db.connect(db.server).then((status) => {
    if (!status) console.log(chalk.bgRed(`  |-> [ERROR] -> Mongo is angry :(`))
}).then(() => {
    clear() // this function to clear the console
    flatit('Otaku API', 'cyan')
})

app.listen(port, (err) => {
    if (err) throw err
    console.log(chalk.bgBlue(`  |->Loading....`))
    console.log(chalk.bgGreen(`  |->Servers are landed... :)`))
})