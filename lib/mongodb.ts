import { MongoClient, Db } from 'mongodb';
import dns from 'dns';

// Ensure Node DNS resolver can resolve MongoDB Atlas SRV records reliably on Windows networks
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('Could not set custom DNS servers:', e);
}

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.warn('Warning: MONGODB_URI is not defined in environment variables.');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (uri) {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(uri);
    clientPromise = client.connect();
  }
}

export async function getCustomerDb(): Promise<Db | null> {
  if (!uri) return null;
  try {
    const client = await clientPromise;
    return client.db('Customer_data');
  } catch (error) {
    console.error('Failed to connect to MongoDB Customer_data DB:', error);
    return null;
  }
}

export default clientPromise!;
