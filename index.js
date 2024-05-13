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
app.use(cors(corsOptions));
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
    const popularBooksCollection = client
      .db("booksDB")
      .collection("popularBooks");

    const borrowedBooksCollection = client
      .db("booksDB")
      .collection("borrowedBooks");

    // Route to fetch all books category
    app.get("/booksCategory", async (req, res) => {
      const cursor = categoryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // Route to fetch books by category
    app.get("/books", async (req, res) => {
      const { category } = req.query;
      const filter = category ? { category } : {};
      const books = await booksCollection.find(filter).toArray();
      res.json(books);
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
    // Route to fetch details of a specific Book
    app.get("/books/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const book = await booksCollection.findOne(query);
      res.json(book);
    });

    // Route to borrow a book
    app.post("/borrowedBooks", async (req, res) => {
      const {
        bookId,
        userEmail,
        borrowedDate,
        returnDate,
        bookName,
        bookImage,
        bookCategory,
      } = req.body;
      const book = await booksCollection.findOne({ _id: new ObjectId(bookId) });

      // Update book quantity
      const updatedQuantity = book.quantity - 1;
      const updateResult = await booksCollection.updateOne(
        { _id: new ObjectId(bookId) },
        { $set: { quantity: updatedQuantity } }
      );
      console.log(updateResult);

      // Add book to borrowedBooks collection
      const borrowedBook = {
        bookId,
        userEmail,
        borrowedDate,
        returnDate,
        bookName,
        bookImage,
        bookCategory,
      };
      const result = await borrowedBooksCollection.insertOne(borrowedBook);
      res.json(result);
    });

    // Route to fetch borrowed books by user's email
    app.get("/borrowedBooks", async (req, res) => {
      const { userEmail } = req.query;
      const query = { userEmail };
      const borrowedBooks = await borrowedBooksCollection.find(query).toArray();
      res.json(borrowedBooks);
    });

    // Route to return a borrowed book
    app.put("/books/return/:bookId", async (req, res) => {
      const { bookId } = req.params;
      const borrowedBook = await borrowedBooksCollection.findOne({
        _id: new ObjectId(bookId),
      });
      // Update the quantity
      const updateResult = await booksCollection.updateOne(
        { _id: new ObjectId(borrowedBook.bookId) },
        { $inc: { quantity: 1 } }
      );
      console.log(updateResult);
      await borrowedBooksCollection.deleteOne({ _id: new ObjectId(bookId) });

      res.status(200).json();
    });

    // Route to fetch borrowed books by user's email
    app.get("/borrowedBooks", async (req, res) => {
      const { userEmail } = req.query;
      const query = { userEmail, status: { $ne: "returned" } };
      const borrowedBooks = await borrowedBooksCollection.find(query).toArray();
      res.json(borrowedBooks);
    });

    // // route for updating a user's book
    app.put("/books/:id", async (req, res) => {
      const bookId = req.params.id;
      const updatedBook = req.body;

      const query = { _id: new ObjectId(bookId) };
      const updateResult = await booksCollection.updateOne(query, {
        $set: updatedBook,
      });
      console.log(updateResult);
      res.json();
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
