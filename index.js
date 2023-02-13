
const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express()
const jwt = require('jsonwebtoken');
// middleware
const corsConfig = {
    origin: "*",
}
app.use(cors(corsConfig))
app.use(express.json())


//mongodb conneted
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vt7v4z6.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try {
        await client.connect();
        const productCollection = client.db("productCollection").collection("products");
        const cartCollection = client.db("cartCollection").collection("cart");


        //  allproducts

        app.get('/products', async (req, res) => {
            const allProducts = await productCollection.find().toArray()
            res.send(allProducts)
        })

        //  get single product by id
        app.get('/product-details/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await productCollection.findOne(query)
            res.send(result)

        })


        // add to cart

        app.put('/addtocart/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const Cart = req.body

            const options = { upsert: true };
            const updatedDoc = {
                $set: Cart
            }
            const result = await cartCollection.updateOne(filter, updatedDoc, options);
            res.send(result)
        })

        //get all cart

        app.get('/allcart', async (req, res) => {
            const allcarts = await cartCollection.find().toArray()
            res.send(allcarts)
        })


        //get myallcart bt email

        app.get('/myallcart/:email', async (req, res) => {
            const email = req.params
            const query = { email: email.email }
            // console.log(query)
            const cursor = await cartCollection.find(query).toArray()
            // console.log(cursor)
            res.send(cursor)
        })

        //delete cart

        app.delete('/deletecart/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await cartCollection.deleteOne(query)
            res.send(result)
        })

    }


    finally {
        //   await client.close();
    }
}
run().catch(console.dir);


app.get("/", (req, res) => {
    res.send("food-store-server");
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});