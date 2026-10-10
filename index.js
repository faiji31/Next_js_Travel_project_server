import dns from "node:dns";
import express from "express";
import dotenv from 'dotenv'
import cors from 'cors'
import { MongoClient } from "mongodb";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config()

const app = express();
const port = process.env.PORT

app.use(express.json());
app.use(cors())

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing from .env");
}

const client = new MongoClient(uri);

export async function connectToMongoDB() {
  try {
    
    await client.connect();

    const db= client.db('wanderlust')
    const destinationCollection = db.collection('destination')


    app.get('/destination',async(req,res)=>{
      const result = await destinationCollection.find().toArray()
      res.json(result)
    })

    app.post('/destination',async(req,res)=>{
      const destinationData = req.body
      console.log(destinationData)
      const result = await destinationCollection.insertOne(destinationData)

      res.json(result)
    })







    console.log("Successfully connected to MongoDB!");

    return client;
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
}

export async function disconnectFromMongoDB() {
  await client.close();
  console.log("MongoDB disconnected.");
}

app.get("/", (req, res) => {
  res.send("Server is running!");
});

async function startServer() {
  try {
    await connectToMongoDB();

    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();