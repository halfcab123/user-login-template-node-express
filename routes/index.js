var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/add-to-cart/:id', function(req, res, next){
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  Product.findById(productId)
      .then(function(err, product){
          if(err){
            return res.redirect('/');
          }
          cart.add(product, product.id);
          req.session.cart = cart;
  })
});

module.exports = router;
