const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3001;

// Middleware
const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors({ corsOptions }));
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
    const booksCollection = client.db("booksDB").collection("books");
    const categoryCollection = client.db("booksDB").collection("booksCategory");
    const popularBooksCollection = client.db("booksDB").collection("popularBooks");

    // Route to fetch all books category
    app.get("/booksCategory", async (req, res) => {
      const cursor = categoryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // Route to fetch Popular books
    app.get("/popularBooks", async (req, res) => {
      const cursor = popularBooksCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // Route to fetch books
    app.get("/books", async (req, res) => {
      const cursor = booksCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // Route to add a new book
    app.post("/books", async (req, res) => {
      const newBook = req.body;
      const result = await booksCollection.insertOne(newBook);
      res.send(result);
    });
    // // Route to fetch of specific book
    app.get("/books/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const book = await booksCollection.findOne(query);
      res.json(book);
    });

    // Route to fetch all tourist spots
    // app.get("/spots", async (req, res) => {
    //   const cursor = spotsCollection.find();
    //   const result = await cursor.toArray();
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

    // // route for updating a user's book
    app.put("/books/:id", async (req, res) => {
      const bookId = req.params.id;
      const updatedBook = req.body;

      const query = { _id: new ObjectId(bookId) };
      const updateResult = await booksCollection.updateOne(query, {
        $set: updatedBook,
      });
      if (updateResult.matchedCount === 0) {
        return res.status(404).json({ error: "User's book not found" });
      }
      res.json({ message: "User's book updated successfully" });
    });

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
