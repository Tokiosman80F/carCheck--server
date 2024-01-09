const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");
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

const verifyJwt=(req,res,next)=>{
  const authorization=req.headers.authorization
  console.log(authorization);
  if(!authorization){
    return res.status(401).send({error:true,message:'before unAuthorize User'})
  }
  const token=authorization.split(" ")[1]
  console.log("token =>",token);
  jwt.verify(token,process.env.ACCESS_KEY,function(err,decoded){
    if(err){
      return res.status(401).send({error:true,message:'After unAuthorize User or token Expired'})
    }
    req.decoded=decoded
    next()
  })
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const serviceDatabase = client.db("carCheckDb").collection("services");
    const bookingDatabase = client.db("carCheckDb").collection("bookings");

    // ----jwt route ---
    app.post('/jwt',(req,res)=>{
      const user=req.body
      const token=jwt.sign(user,process.env.ACCESS_KEY,{expiresIn:'1h'})
      console.log("token",token);
      console.log("token object",{token});
      res.send({token})
    })
    //  service route--- getting data
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
    // booking route--- booking data
    app.post("/booking", async (req, res) => {
      const booking = req.body;
      console.log("booking =>", booking);
      const result = await bookingDatabase.insertOne(booking);
      res.send(result);
    });
    // getting booking data
    app.get("/booking",verifyJwt , async (req, res) => {
      const decoded=req.decoded
      let query = {};
      if(decoded.email!==req.query.email)
      {
        return res.status(403).send({error:true,message:"user not found"})
      }
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const booking = await bookingDatabase.find(query).toArray();
      res.send(booking);
    });
    // deleting booking data
    app.delete("/booking/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await bookingDatabase.deleteOne(filter);
      res.send(result);
    });
    // update the booking status
    app.patch("/booking/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateBooking = req.body;
      const updateDoc = {
        $set: {
          status: updateBooking.status,
        },
      };
      const result = await bookingDatabase.updateOne(filter, updateDoc);
      res.send(result);
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

app.get("/", (req, res) => {
  res.send("hello carcheck ");
});
app.listen(port, () => {
  console.log(`example app listening on port ${port}`);
});
