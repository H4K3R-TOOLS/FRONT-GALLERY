import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI || ""
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient> | undefined

if (uri && typeof window === 'undefined') {
  if (process.env.NODE_ENV === "development") {
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>
    }

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options)
      globalWithMongo._mongoClientPromise = client.connect()
    }
    clientPromise = globalWithMongo._mongoClientPromise
  } else {
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
  }
}

export function getMongoClientPromise(): Promise<MongoClient> | undefined {
  if (!clientPromise && process.env.MONGODB_URI && typeof window === 'undefined') {
    client = new MongoClient(process.env.MONGODB_URI, options)
    clientPromise = client.connect()
  }
  return clientPromise
}

export default clientPromise
