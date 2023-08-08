const express = require('express');

const router = express.Router();

const { addRecord,createTable,allRecords,deleteTable} = require('../controller/user');

router.get('/', allRecords);
router.post('/', addRecord);
router.delete('/', deleteTable);
router.post('/table', createTable);




module.exports = router;