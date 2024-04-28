const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gpuomtl.mongodb.net`;

async function run() {
  try {
    // Create a MongoClient with a MongoClientOptions object to set the Stable API version
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
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
  const spotsCollection = client.db("spotsDB").collection("spots");
  const countriesCollection = client.db("spotsDB").collection("countries");

  // Route to fetch all countries
  app.get("/countries", async (req, res) => {
    const cursor = countriesCollection.find();
    const result = await cursor.toArray();
    res.send(result);
  });


  // Route to fetch all tourist spots
  app.get("/spots", async (req, res) => {
    try {
      const cursor = spotsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    } catch (error) {
      console.error("Error fetching tourist spots:", error);
      res.status(500).json({ error: "Failed to fetch tourist spots" });
    }
  });

  // Route to add a new tourist spot
  app.post("/spots", async (req, res) => {
    try {
      const newSpot = req.body;
      const result = await spotsCollection.insertOne(newSpot);
      res.send(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error });
    }
  });

  // Route to fetch details of a specific tourist spot
  app.get("/spots/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const spot = await spotsCollection.findOne(query);
      res.json(spot);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error });
    }
  });

  // Route to fetch user's tourist spots
  app.get("/user-spots", async (req, res) => {
    const userEmail = req.query.userEmail;
    try {
      const userSpots = await spotsCollection.find({ userEmail }).toArray();
      res.json(userSpots);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error });
    }
  });
  // Delete
  app.delete("/user-spots/:id", async (req, res) => {
    const spotId = req.params.id;
    const query = { _id: new ObjectId(spotId) };
    const result = await spotsCollection.deleteOne(query);
    res.send(result);
  });

  // route for updating a user spot
  app.put("/user-spots/:id", async (req, res) => {
    const spotId = req.params.id;
    const updatedSpot = req.body;

    const query = { _id: new ObjectId(spotId) };
    const updateResult = await spotsCollection.updateOne(query, {
      $set: updatedSpot,
    });
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ error: "User spot not found" });
    }
    res.json({ message: "User spot updated successfully" });
  });

  // Send a ping to confirm a successful connection
  await client.db("admin").command({ ping: 1 });
  console.log("Pinged your deployment. You successfully connected to MongoDB!");

  // Start the server
  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });
}

// Run the server
run().catch(console.error);
