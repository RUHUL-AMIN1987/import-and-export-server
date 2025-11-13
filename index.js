const express = require ('express')
const cors = require ('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 3000




app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.USER_ID}:${process.env.PASS_WORD}@cluster0.obmjqd4.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



async function run() {
  try {
    await client.connect();

    const db = client.db('smart_db');
    const productsCollection = db.collection('products');
    const bidsCollection = db.collection('bids');
    const userCollection = db.collection('users');



    

 // GET all user
app.post('/users', async(req, res) =>{
    const newUser = req.body;

    const email = req.body.email;
    const query = {email:email};
    const existingUser = await userCollection.findOne(query);
    if(existingUser){
        console.log("Existing user found:", existingUser); 
        res.send({message: 'User already exits.'})
    }

    else{
        const result = await userCollection.insertOne(newUser);
    res.send(result);
    }
});


    // GET all products
app.get('/products', async (req, res) => {
  try {
    const projectField = {
      _id: 1,
      product_name: 1,
      product_image: 1,
      price: 1,
      origin_country: 1,
      rating: 1,
      available_quantity: 1
    };

    const cursor = productsCollection.find({}, { projection: projectField });
    const result = await cursor.toArray();

    res.send(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send({ message: 'Failed to fetch products' });
  }
});


 app.get('/latest-products', async(req, res) =>{
    const cursor = productsCollection.find().sort({created_at: -1}).limit(6);
    const result = await cursor.toArray()
    res.send(result);
 })
    //GET products by ID
app.get('/products/:id', async (req, res) =>{
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await productsCollection.findOne(query);
    res.send(result);
})

// POST a new product
app.post('/products', async (req, res) => {
    const newProduct = req.body;
    const result = await productsCollection.insertOne(newProduct);
    res.send(result);
});

  

    // DELETE 
    app.delete('/products/:id', async(req, res) =>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await productsCollection.deleteOne(query);
        res.send(result);
    })

    app.get('/products/bids/:productId', async(req, res)=>{
        const productId = req.params.productId;
        const query = {product: productId};
        const cursor = bidsCollection.find(query).sort({bid_price: -1});
        const result = await cursor.toArray();
        res.send(result);
    })

    //BID collection

    app.get('/bids', async(req, res) =>{
        const email = req.query.email;
        const query = {};
        if(email){
            query.buyer_email = email
        }
        const cursor = bidsCollection.find(query)
        const result = await cursor.toArray()
        res.send(result)
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);

app.listen(port, () =>{
    console.log(`Smart Server Is Running on Port, ${port}` )
})


