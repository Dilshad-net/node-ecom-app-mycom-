const express = require('express')
require('./db/mongoose')
const path = require('path')
const hbs = require('hbs')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const session = require('express-session')
const passport = require('passport')
const flash = require('connect-flash')
require('./config/passport')
const MongoStore = require('connect-mongo')(session)
const Product = require('./models/product')
const mainRouter = require('./routers/main')
const userRouter = require('./routers/user')
const productRouter = require('./routers/producer')

const app = express()

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })

app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(session({ 
    secret: 'thisisaSecret', 
    resave: false, 
    saveUninitialized: false, 
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 120 * 60 * 1000 } 
}))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
app.use('/user', userRouter)
app.use(productRouter)
app.use('/', mainRouter)

const port = process.env.PORT || 3000

const publicDirectory = path.join(__dirname, '../public')
const viewsDirectory = path.join(__dirname, '../templates/views')
const partialsDirectory = path.join(__dirname, '../templates/partials')

app.set('view engine', 'hbs')
app.set('views', viewsDirectory)
hbs.registerPartials(partialsDirectory)

app.use(express.static(publicDirectory))

app.use((req, res, next) => {
    res.locals.login = req.isAuthenticated()
    res.locals.session = req.session
    next()
})

app.listen(port, () => {
    console.log('listerning on ', port)
})