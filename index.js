const express = require('express')
const cors = require('cors');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.i1ux4.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const productsCollection = client.db('medz_app').collection('products')
        const ordersCollection = client.db('medz_app').collection('orders')


        app.get('/products', async (req, res) => {
            const query = {}
            const cursor = productsCollection.find(query)
            const products = await cursor.toArray()
            res.send(products)
        });


        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const products = await productsCollection.findOne(query);
            console.log(id);
            console.log(query);
            res.send(products);

        })

        app.post('/orders', async (req, res) => {
            const orders = req.body
            const result = await ordersCollection.insertOne(orders)
            res.send(result)
        })

        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const newQuantity = req.body
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    availableQuantity: newQuantity.updateQuantity
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