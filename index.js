const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

require("dotenv").config();

const uri = `mongodb+srv://${process.env.BUCKET}:${process.env.BUCKET_KEY}@cluster0.lyiobzh.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const serviceDatabase = client.db("carCheckDb").collection("services");
    const bookingDatabase = client.db("carCheckDb").collection("bookings");

    // getting data
    app.get("/services", async (req, res) => {
      const result = await serviceDatabase.find().toArray();
      res.send(result);
    });
    // getting specific data
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { projection: { title: 1, price: 1, img: 1 } };
      const result = await serviceDatabase.findOne(filter, options);
      res.send(result);
    });
    // booking data
    app.post("/booking",async (req,res)=>{
        const booking=req.body
        console.log("booking =>",booking);
        const result=await bookingDatabase.insertOne(booking)
        res.send(result)
    })
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

app.get("/", (req, res) => {
  res.send("hello carcheck ");
});
app.listen(port, () => {
  console.log(`example app listening on port ${port}`);
});
