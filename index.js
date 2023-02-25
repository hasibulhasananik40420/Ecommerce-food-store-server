
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


//verifyJWT jwt token

function verifyJWT(rrq, res, next) {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        return res.status(401).send({ message: "Unauthorized access" })
    }

    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: "Forbiden access" })
        }
        res.decoded = decoded
        next()
    })
}









async function run() {
    try {
        await client.connect();
        const productCollection = client.db("productCollection").collection("products");
        const cartCollection = client.db("cartCollection").collection("cart");
        const userCollection = client.db("userCollection").collection("user");


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

        app.post('/addtocart/:id', async (req, res) => {
            const id = req.params.id;
            const email = req.query.email
            const Cart = req.body
            const filter = {
                $and: [
                    { _id: new ObjectId(id) },
                    { 'userEmail': email }
                ]
            };

            console.log(filter)
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


        // save all user in database
        app.put('users/:email', async (req, res) => {
            const email = req.params.email
            const user = req.body
            const filter = { email: email }
            const options = { upsert: true };
            const updateDoc = {
                $set: user
            }
            const result = await userCollection.updateOne(filter, updateDoc, options)
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
            console.log(token)
            res.send({ result, token })

        })

        // app.get('/jwt', async (req, res) => {
        //     const email = req.query.email
        //     const query = { email: email }
        //     console.log(query)
        //     const user = await userCollection.findOne(query)
        //     if (user) {
        //         const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
        //         return res.send({ accessToken: token })
        //     }
        //     console.log(user)
        //     res.status(403).send({ accessToken: '' })
        // })


        // app.post('/users', async (req, res) => {
        //     const user = req.body
        //     const result = await userCollection.insertOne(user)
        //     res.send(result)
        // })


        // male admin

        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email
            const user = await userCollection.findOne({ email: email })
            const isAdmin = user.role === 'admin'
            res.send({ admin: isAdmin })
        })

        // role set

        app.put('/user/admin/:email', async (req, res) => {
            const email = req.params.email
            const filter = { email: email }
            const updatedDoc = {
                $set: { role: 'admin' }
            }
            const result = await userCollection.updateOne(filter, updatedDoc)
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