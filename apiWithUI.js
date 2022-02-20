const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT || 7623;
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoUrl = "mongodb+srv://local:test12345@cluster0.f8vmc.mongodb.net"

let db;
let col_name = "techRegister"
let token_access = "dee7171e0d39ff40b9919e9ca40e1492"
let register_token = "f301de4b2ddfa3b0844d1d34400dda04"

// middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());

// health check
app.get('/',(req,res) => {
    if(req.query.token == token_access){
        db.collection(col_name).find({}).toArray((err,result) => {
            if(err) throw err;
            res.status(200).render('index',{data:result})
        })
    }else{
        res.send("Unauthorized")
    }
    
});

app.get('/health',(req,res) => {
    if(req.query.token == token_access){
        res.status(200).send('Health Ok');
    }else{
        res.send("Unauthorized")
    }
});

//render Form
app.get('/new',(req,res) => {
    if(req.query.token == token_access){
        res.render('admin')
    }else{
        res.send("Unauthorized")
    }
    
})

// static file path
app.use(express.static(__dirname+'/public'));
// html file path
app.set('views','./src/views')
//view engine path
app.set('view engine', 'ejs')

//Read
app.get('/users',(req,res) => {
    if(req.query.token == token_access){
        var query = {}
        if(req.query.city && req.query.role){
            query={city:req.query.city,role:req.query.role,isActive:true}
        }
        else if(req.query.city){
            query={city:req.query.city,isActive:true}
        }
        else if(req.query.role){
            query={role:req.query.role,isActive:true}
        }
        else if(req.query.isActive){
            let isActive = req.query.isActive;
            if(isActive == "false"){
                isActive = false
            }else{
                isActive = true
            }
            // query = {isActive:isActive}
            query = {isActive}
        }
        else{
            query={isActive:true}
        }
        db.collection(col_name).find(query).toArray((err,result) => {
            if(err) throw err;
            res.status(200).send(result);
        });
    }else{
        res.send("Unauthorized")
    }

    
});

//Add user > POST
app.post('/register',(req,res) => {
    if(req.query.token == register_token){
        const data = {
            "name":req.body.name,
            "email":req.body.email,
            "phone":req.body.phone,
            "date":new Date(),
            "status":'Not Called'
        }
        db.collection(col_name).insertOne(data,(err,result) => {
            if(err) throw err;
            //res.status(200).send('User Added');
            res.redirect('http://technofunnel.in/?status=Registration Successful')
        })
    }else{
        res.redirect('http://technofunnel.in/?status=Unauthorized')
    }
})

// update the user > put/patch
app.put('/updateUser',(req,res) => {
    if(req.query.token == token_access){
        db.collection(col_name).updateOne(
            {_id:mongo.ObjectId(req.body._id)},
            {
                $set:{
                    name:req.body.name,
                    city:req.body.email,
                    phone:req.body.phone,
                    status:'Not Joined'
                }
            },(err,result) =>{
                if(err) throw err;
                res.status(200).send('Data Updated')
            }
        )
    }else{
        res.send("Unauthorized")
    }
})

// hard delete
app.delete('/deleteUser',(req,res) => {
    if(req.query.token == token_access){
        db.collection(col_name).remove(
            {_id:mongo.ObjectId(req.body._id)},(err,result) => {
                if(err) throw err;
                res.send('User Removed')
            }
        )
    }else{
        res.send("Unauthorized")
    }
})


// soft delete (deactivate)
app.put('/deactivateUser',(req,res) => {
    db.collection(col_name).updateOne(
        {_id:mongo.ObjectId(req.body._id)},
        {
            $set:{
                status:'Not Called'
            }
        },(err,result) =>{
            if(err) throw err;
            res.status(200).send('User Deactivate')
        }
    )
})

// Activate
app.put('/activateUser',(req,res) => {
    db.collection(col_name).updateOne(
        {_id:mongo.ObjectId(req.body._id)},
        {
            $set:{
                status:'Called'
            }
        },(err,result) =>{
            if(err) throw err;
            res.status(200).send('User Activate')
        }
    )
})
//DB COnnection
MongoClient.connect(mongoUrl,(err,client) => {
    if(err) console.error(`Error While connecting ${err}`)
    db = client.db('technofunnel');
    app.listen(port, (err) => {
        console.error(`Server is running on port ${port}`)
    })
})
