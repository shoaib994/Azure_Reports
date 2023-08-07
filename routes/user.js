const express = require('express');

const router = express.Router();

const { getDataA,createTable} = require('../controller/user');

router.get('/', getDataA);
router.post('/', getDataA);
router.get('/table', createTable);




module.exports = router;