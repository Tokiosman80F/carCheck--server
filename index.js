const express = require("express");
const app = express();
const port = process.env.port || 3000;

app.get("/", (req, res) => {
  res.send("Hello Car Check !");
});

require("dotenv").config();
console.log(process.env.BUCKET);

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.BUCKET}:${process.env.BUCKET_kEY}@cluster0.lyiobzh.mongodb.net/?retryWrites=true&w=majority`;

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
    const services = client.db("carCheck").collection("services");

    app.get("/services",async (req,res)=>{
        const result= await services.find().toArray()
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
run().catch(console.log);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
