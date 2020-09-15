const express = require('express')
const router = new express.Router()
const csrf = require('csurf')
const passport = require('passport')
const Product = require('../models/product')
const Cart = require('../models/cart')
const Order = require('../models/order')

const csrfProtection = csrf()
router.use(csrfProtection)

router.get('/profile', isLoggedIn, async (req, res) => {
    try {
        const order = await Order.find({ user: req.user })

        var cart;
        order.forEach((order) => {
            cart = new Cart(order.cart)
            order.items = cart.generateArray()
        })
        res.render('user/profile', { orders: order })
    } catch (error) {
        res.render('404', { error: 'Some error please!'})
    }
})

router.get('/logout', isLoggedIn, (req, res) => {
    req.logout()
    res.redirect('/')
})

router.use('/', isLoggedOut, (req, res, next) => {
    next()
})

router.post('/signup', passport.authenticate('local.signup', {
    failureRedirect: '/user/signup',
    failureFlash: true
}), (req, res, next) => {
    if (!req.session.oldUrl) {
        return res.redirect('/user/profile')
    }
    var oldUrl = req.session.oldUrl
    req.session.oldUrl = null
    res.redirect(oldUrl)
})

router.post('/signin', passport.authenticate('local.signin', {
    failureRedirect: '/user/signin',
    failureFlash: true
}), (req, res, next) => {
    if (!req.session.oldUrl) {
        return res.redirect('/user/profile')
    }
    var oldUrl = req.session.oldUrl
    req.session.oldUrl = null
    res.redirect(oldUrl)
})

router.get('/signup', (req, res) => {
    const messages = req.flash('error')
    res.render('signup', { csrfToken: req.csrfToken(), messages: messages, hasError: messages.length > 0 })
})

router.get('/signin', (req, res) => {
    const messages = req.flash('error')
    res.render('signin', { csrfToken: req.csrfToken(), messages: messages, hasError: messages.length > 0 })
})

router.get('*' , (req, res) => {
    res.render('404', {error: 'Sorry No such Routes!!!'})
})

module.exports = router

function isLoggedIn(req, res, next){
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/')
}

function isLoggedOut(req, res, next){
    if (!req.isAuthenticated()) {
        return next()
    }
    res.redirect('/')
}