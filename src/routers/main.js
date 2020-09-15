const express = require('express')
const router = new express.Router()
const Product = require('../models/product')
const Cart = require('../models/cart')
const Order = require('../models/order')

router.get('', async (req, res) => {
    var successMsg = req.flash('success')[0]
    try {
        const products = await Product.find((err, docs) => {
            var productChunks = []
            var chunkSize = docs.length
            for (let i = 0; i < docs.length; i += chunkSize ) {
                productChunks.push(docs.splice(i, i + chunkSize))    
            }
            res.render('index', { products: productChunks, successMsg: successMsg, noMessage: !successMsg })
        })
    } catch (e) {
        res.render('404', { error: e })
    }
})

router.get('/add_to_cart/:id', (req, res) => {
    const id = req.params.id
    // try {
    //     const cart = new Cart(req.session.cart ? req.session.cart : {})
    //     const product = Product.findById(id)
    //     cart.add(product, product._id)
    //     req.session.cart = cart
    //     res.redirect('/')
    // } catch (e) {
    //     res.render('404', {e: 'Unexpected error' })
    // }
    const cart = new Cart(req.session.cart ? req.session.cart : {})
    Product.findById(id, (err, product) => {
        if (err) {
            return res.redirect('/')
        }
        cart.add(product, product.id)
        req.session.cart = cart
        res.redirect('/')
    })
})

router.get('/reduce/:id', (req, res) => {
    const id = req.params.id
    const cart = new Cart(req.session.cart ? req.session.cart : {})

    cart.reduceOne(id)
    req.session.cart = cart
    res.redirect('/view_cart')
})

router.get('/remove_all/:id', (req, res) => {
    const id = req.params.id
    const cart = new Cart(req.session.cart ? req.session.cart : {})

    cart.reduceAll(id)
    req.session.cart = cart
    res.redirect('/view_cart')
})

router.get('/view_cart', (req, res) => {
    if(!req.session.cart){
        return res.render('cart', {products: null})
    }
    const cart = new Cart(req.session.cart)
    res.render('cart', {products: cart.generateArray(), totalPrice: cart.totalPrice})
})

router.get('/checkout', isLoggedIn, (req, res) => {
    if(!req.session.cart){
        return res.redirect('/view_cart')
    }
    const cart = new Cart(req.session.cart)
    var errMsg = req.flash('error')[0] //Mapping
    res.render('checkout', { total: cart.totalPrice, errMsg: errMsg, noError: !errMsg })
})

router.post('/checkout', isLoggedIn, async (req, res) => {
    try{
        if(!req.session.cart){
            return res.redirect('/view_cart')
        }
        const cart = new Cart(req.session.cart)
    
        const stripe = require('stripe')(
            process.env.STRIPE_SERVER_KEY
            );
        // `source` is obtained with Stripe.js; see https://stripe.com/docs/payments/accept-a-payment-charges#web-create-token
        const charge = await stripe.charges.create({
            amount: cart.totalPrice * 100,
            currency: 'usd',
            source: req.body.stripeToken, //Obtained with Stripe.js
            description: 'My First Test Charge (created for API docs)',
        }, (err, charge) => {
            if (err) {
                req.flash('error', err.message)
                return res.redirect('/checkout')
            }
            const order = new Order({user: req.user, cart: cart, address: req.body.address, name: req.body.name, paymentId: charge.id})

            order.save((err, result)=> {
                if (err) {
                    return res.render('404', { e: err})
                }
                req.flash('success', 'Successfull Payment!')
                req.session.cart = null
                res.redirect('/')
            })
        });
    }catch(e) {
        res.render('404', {e: 'Sorry some error'})
    }
})

module.exports = router

function isLoggedIn(req, res, next){
    if (req.isAuthenticated()) {
        return next()
    }
    req.session.oldUrl = req.url
    res.redirect('/user/signin')
}