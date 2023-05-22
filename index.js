const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());
const port = 3000;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  "mongodb+srv://shahriarabir:12345678a@programminghero.pktpt8h.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const Collection = client.db("dctoys").collection("toys");
    const indexKeys = { name: 1 };
    const indexOptions = { name: "name" };
    const result = await Collection.createIndex(indexKeys, indexOptions);
    // all toys
    app.get("/alltoys", async (req, res) => {
      const limit = parseInt(20);
      const result = await Collection.find().limit(limit).toArray();
      res.send(result);
      console.log(result);
    });
    //   toyseacrh by name
    app.get("/alltoys/:toyname", async (req, res) => {
      const text = req.params.toyname;
      const result = await Collection.find({
        $or: [
          { toy_name: { $regex: text, $options: "i" } },
          { email: { $regex: text, $options: "i" } },
          { seller_name: { $regex: text, $options: "i" } },
          { category: { $regex: text, $options: "i" } }
        ]
      }).toArray();
      res.send(result);
    });
    // toy details
    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await Collection.findOne(query);
      res.send(result);
    });

    app.get("/sellertoy", async (req, res) => {
      const result = await Collection.find({
        email: req.query?.email
      }).toArray();
      res.send(result);
    });

    // for updating dataa
    app.patch("/update/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          price: body.price,
          available: body.quantity,
          description: body.description
        }
      };
      const result = await Collection.updateOne(filter, updatedDoc);
      res.send(result);
    });
    // for adding  toy 
    app.post("/addtoy", async (req, res) => {
      const toy = req.body;
      const result = await Collection.insertOne(toy);
      res.send(result);
    });

    app.delete("/sellertoy/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await Collection.deleteOne(filter);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
   
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`server is running ${port}`);
});
