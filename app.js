var express = require('express');
var app = express();

var mongoDB = require('mongodb');
var MongoClient = mongoDB.MongoClient;
var port = process.env.PORT||8080;
var mongoUrl = 'mongodb+srv://naga:test123@edumato.1t9ez.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
let db;

var cors = require('cors');
const { query } = require('express');
app.use(cors());

// Home
app.get('/', (req, res)=>{
    res.send("Welcome to Edumato api by naga")
})

// mealtypes
app.get('/mealtypes', (req, res)=>{
    db.collection('mealtypes').find().toArray((err, result)=>{
        if(err) throw err;
        res.send(result);
    })
})

// locations
app.get('/locations', (req, res)=>{
    db.collection('locations').find().toArray((err, result)=>{
        if(err) throw err;
        if(!req.query.states) res.send(result);
        else{
            var filters = [];
            result.map((location)=>{
                var x = {id:location.state_id,state:location.state};
                if(filters.filter((i)=>{
                    return (i.id == x.id && i.state==x.state);
                }).length == 0) filters.push(x);
            })
            res.send(filters);
        }
    })
})

// restaurants
app.get('/restaurants', (req, res)=>{
    var cuisines = req.query.cuisine?req.query.cuisine:'1,2,3,4,5,6';
    cuisines = cuisines.split(',')
    var cuisineIndex = 0;
    cuisines.map((item)=>{
        cuisines[cuisineIndex] = Number(item);
        cuisineIndex++;
    })
    console.log(cuisines)
    var query = {};
    if(req.query.state){
        if(!req.query.mealtype) query.state_id = Number(req.query.state);
        else{
            query = {
                state_id: Number(req.query.state),
                "cuisines.cuisine_id":{$in:cuisines},
                "mealTypes.mealtype_id":Number(req.query.mealtype)
            }
        }
    }
    else query = {mealtype:-1};

    var sortkey = req.query.sort?Number(req.query.sort):1;

    var lcost = req.query.lcost?Number(req.query.lcost):0;
    var hcost = req.query.hcost?Number(req.query.hcost):10000;
    query.$and = [{cost:{$lt:hcost,$gt:lcost}}];

    db.collection('restaurantdata').find(query).sort({cost:sortkey}).toArray((err, result)=>{
        if(err) throw err;
        res.send(result);
    })
})

app.get('/restaurantDetails/:restaurant_id', (req, res)=>{
    db.collection('restaurantdata').find({"restaurant_id":Number(req.params.restaurant_id)}).toArray((err, result)=>{
        if(err) throw err;
        res.send(result)
    })
})

// connect db
MongoClient.connect(mongoUrl, (err, client)=>{
    if(err) console.log('error while connecting');
    else{
        db = client.db('edumato1');
    }
})

app.listen(port, ()=>{
    console.log('running on ',port)
});
