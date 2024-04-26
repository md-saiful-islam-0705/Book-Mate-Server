const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gpuomtl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

async function run() {
    try {
        // Create a MongoClient with a MongoClientOptions object to set the Stable API version
        const client = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });

        // Connect the client to the server
        await client.connect();

        // Database connection successful, define routes and start server
        defineRoutes(client);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); // Exit the process if MongoDB connection fails
    }
}

async function defineRoutes(client) {
    const spotsCollection = client.db('spotsDB').collection('spots');

    app.get('/spots', async (req, res) => {
        const cursor = spotsCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    }) 

    app.post('/spots', async (req, res) => {
        const newSpot = req.body;
        console.log(newSpot);
        const result = await spotsCollection.insertOne(newSpot);
        res.send(result);
    })
    
    

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // Start the server
    app.listen(port, () => {
        console.log(` Server is running on port: ${port}`);
    });
}

// Run the server
run().catch(console.error);
