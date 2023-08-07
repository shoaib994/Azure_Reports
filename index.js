
const express=require('express');
const app=express()
require('dotenv').config()
const cors = require("cors");
const PORT=process.env.PORT ||4000
const path = require("path");
const sql = require("mssql");

app.listen(PORT,()=>console.log(`server is working on ${PORT}`))
const config = {
    user: process.env.USER,
    password: process.env.PASSWORD,
    server: process.env.SERVER,
    database: process.env.DATABASE,
    options: {
      encrypt: true, // For secure connections
    },
  };
  // console.log('c',config)
   sql.connect(config).then((res)=>console.log('database connected successfully')).catch((err)=>console.log(err.message));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
const corsOptions = {
    origin: '*',
    'Access-Control-Allow-Origin': '*',
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200,
}

app.use(cors(corsOptions)) // Use this after the variable declaration

app.use('/api/v1/record', require('./routes/user'))
 
module.exports=app