const express = require('express')
const router = new express.Router()
const mongoose = require('../db/mongoose')
const Product = require('../models/product')

router.post('/business/set', async (req, res) => {
    const product = new Product(req.body)
    try {
        await product.save()
        res.status(201).send(product)
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router