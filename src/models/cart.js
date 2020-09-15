module.exports = function Cart(existingCart) {
    this.items = existingCart.items || {}
    this.totalQty = existingCart.totalQty || 0
    this.totalPrice = existingCart.totalPrice || 0

    this.add = function(item, id) {
        var storedItem = this.items[id]
        if (!storedItem) {
            storedItem = this.items[id] = {item: item, qty: 0, price: 0}
        }
        storedItem.qty++
        storedItem.price = storedItem.item.price * storedItem.qty
        this.totalQty++
        this.totalPrice += storedItem.item.price
    }

    this.reduceOne = function(id) {
        this.items[id].qty--
        this.items[id].price -= this.items[id].item.price
        this.totalQty--
        this.totalPrice -= this.items[id].item.price

        if(this.items[id].qty <= 0){
            delete this.items[id]
        }
    }

    this.reduceAll = function(id){
        this.totalQty -= this.items[id].qty
        this.totalPrice -= this.items[id].price
        delete this.items[id]
    }

    this.generateArray = function(){
        const array = []
        for(const id in this.items){
            array.push(this.items[id])
        }
        return array
    }
}