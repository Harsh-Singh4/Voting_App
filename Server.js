const express= require('express');
const app=express();
const db=require('./db');
require('dotenv').config;

const bodyParser=require('body-parser');
app.use(bodyParser.json());

const PORT = process.env.PORT||3000;

const userRoutes=require('./Routes/userRoutes');
const candidateRoutes=require('./Routes/candidateRoutes');

//const {jwtAuthMiddleware} =require('./jwt');

app.use('/user',userRoutes);
app.use('/candidate',candidateRoutes);

app.listen(PORT,()=>{
    console.log(`Server Running on Port ${PORT}`);
})