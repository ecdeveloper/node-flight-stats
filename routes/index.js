var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', { title: 'Flight status checker' });
});

router.get('/partials/:template', function (req, res) {
	res.render('partials/' + req.param('template'));
});

module.exports = router;
