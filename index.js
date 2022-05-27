const express = require('express')
const cors = require('cors');
require('dotenv').config()
const app = express()
const jwt = require('jsonwebtoken')
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const verify = require('jsonwebtoken/verify');

app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.i1ux4.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const productsCollection = client.db('medz_app').collection('products')
        const ordersCollection = client.db('medz_app').collection('orders')
        const usersCollection = client.db('medz_app').collection('users')
        const reviewsCollection = client.db('medz_app').collection('reviews')


        app.get('/products', async (req, res) => {
            const query = {}
            const cursor = productsCollection.find(query)
            const products = await cursor.toArray()
            res.send(products)
        });

        // add product
        app.post('/products', async (req, res) => {
            const newProduct = req.body
            console.log(newProduct);
            const result = await productsCollection.insertOne(newProduct)
            res.send(result)
        })

        app.get('/reviews', async (req, res) => {
            const query = {}
            const cursor = reviewsCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        });

        // review
        app.post('/reviews', async (req, res) => {
            const newReview = req.body
            console.log(newReview);
            const result = await reviewsCollection.insertOne(newReview)
            res.send(result)
        })


        // delete product
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query)
            res.send(result)
        })

        // admin area
        app.put('/users/admin/:email', async (req, res) => {
            const email = req.params.email
            const filter = { email: email }
            const updateDoc = {
                $set: { role: 'admin' },
            }
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.send(result)
        })


        // user add site 
        app.put('/users/:email', async (req, res) => {
            const email = req.params.email
            const users = req.body
            const filter = { email: email }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    name: users.name,
                    occupation: users.occupation,
                    number: users.number,
                    address: users.address,
                    description: users.description,
                }
            }
            const result = await usersCollection.updateOne(filter, updateDoc, options)
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ result, token })
        })



        // app.put('/users/:email', async(req, res) =>{
        //     const email = req.params.email;
        //     const user = req.body;
        //     const filter = {email: email};
        //     const options = {upsert: true};
        //     const updateDoc ={
        //         $set: {
        //                 name: users.name,
        //                 occupation: users.occupation,
        //                 number: users.number,
        //                 address: users.address,
        //                 description: users.description,
        //         }
        //     }
        //     const result = await usersCollection.updateOne(filter, updateDoc, options);
        //     res.send(result);
        // })








        app.get('/users', async (req, res) => {
            const query = {}
            const cursor = usersCollection.find(query)
            const users = await cursor.toArray()
            res.send(users)
        });

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const products = await productsCollection.findOne(query);
            console.log(id);
            console.log(query);
            res.send(products);
        })

        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const authorization = req.headers.authorization
            console.log(authorization);
            const query = { email: email }
            const orders = await ordersCollection.find(query).toArray()
            res.send(orders)
        })


        app.post('/orders', async (req, res) => {
            const orders = req.body
            const result = await ordersCollection.insertOne(orders)
            res.send(result)
        })

        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const newQuantity = req.body
            console.log(newQuantity);
            const query = { _id: ObjectId(id) };
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    available: newQuantity.updateQuantity
                }
            }
            const result = await productsCollection.updateOne(query, updateDoc, options);
            res.send(result);
        })




    }



    finally {

    }

}

run().catch(console.dir);








app.get('/', (req, res) => {
    res.send('All ok')
})

app.listen(port, () => {
    console.log(`Medz app listening on port ${port}`)
})