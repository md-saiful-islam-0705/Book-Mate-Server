const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3001;

// Middleware
// {origin: ""}
//bookmate
//95G5KhCOO8zTr2E8
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gpuomtl.mongodb.net`;
console.log(uri);

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const categoryCollection = client.db("booksDB").collection("booksCategory");
    

    // Route to fetch all books category
    app.get("/booksCategory", async (req, res) => {
      const cursor = categoryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Route to fetch all tourist spots
    // app.get("/spots", async (req, res) => {
    //   const cursor = spotsCollection.find();
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });

    // // Route to add a new tourist spot
    // app.post("/spots", async (req, res) => {
    //   const newSpot = req.body;
    //   const result = await spotsCollection.insertOne(newSpot);
    //   res.send(result);
    // });

    // // Route to fetch details of a specific tourist spot
    // app.get("/spots/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) };
    //   const spot = await spotsCollection.findOne(query);
    //   res.json(spot);
    // });

    // // Route to fetch tourist spots by country
    // app.get("/spots/:countryName", async (req, res) => {
    //   const countryName = req.params.countryName;
    //   const cursor = spotsCollection.find({ country_Name: countryName });
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });

    // // Route to fetch user's tourist spots
    // app.get("/user-spots", async (req, res) => {
    //   const userEmail = req.query.userEmail;
    //   const userSpots = await spotsCollection.find({ userEmail }).toArray();
    //   res.json(userSpots);
    // });
    // // Delete
    // app.delete("/user-spots/:id", async (req, res) => {
    //   const spotId = req.params.id;
    //   const query = { _id: new ObjectId(spotId) };
    //   const result = await spotsCollection.deleteOne(query);
    //   res.send(result);
    // });

    // // route for updating a user spot
    // app.put("/user-spots/:id", async (req, res) => {
    //   const spotId = req.params.id;
    //   const updatedSpot = req.body;

    //   const query = { _id: new ObjectId(spotId) };
    //   const updateResult = await spotsCollection.updateOne(query, {
    //     $set: updatedSpot,
    //   });
    //   if (updateResult.matchedCount === 0) {
    //     return res.status(404).json({ error: "User spot not found" });
    //   }
    //   res.json({ message: "User spot updated successfully" });
    // });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
app.get("/", (req, res) => {
  res.send(" server is running");
});
