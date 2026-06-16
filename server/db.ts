import mongoose from 'mongoose';

export let isMongoConnected = false;
let connectionAttempted = false;

export async function connectDB(): Promise<void> {
  if (connectionAttempted) return;
  connectionAttempted = true;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('[db] MONGODB_URI not set — using in-memory fallback data');
    return;
  }

  try {
    await mongoose.connect(uri);
    isMongoConnected = true;
    console.log('[db] MongoDB connected');
  } catch (err) {
    console.error('[db] MongoDB connection error:', err);
  }
}

export async function getCollectionNames(): Promise<string[]> {
  if (!isMongoConnected) return [];
  try {
    const collections = await mongoose.connection.db!.listCollections().toArray();
    return collections.map((c) => c.name);
  } catch {
    return [];
  }
}

export async function getCollectionDocuments(name: string, limit = 50): Promise<any[]> {
  if (!isMongoConnected) return [];
  try {
    return await mongoose.connection.db!.collection(name).find({}).limit(limit).toArray();
  } catch {
    return [];
  }
}

export async function createDocument(collectionName: string, data: any): Promise<any> {
  if (!isMongoConnected) throw new Error('Not connected');
  return await mongoose.connection.db!.collection(collectionName).insertOne(data);
}

export async function updateDocument(collectionName: string, id: string, data: any): Promise<any> {
  if (!isMongoConnected) throw new Error('Not connected');
  const { ObjectId } = await import('mongodb');
  return await mongoose.connection.db!.collection(collectionName).updateOne(
    { _id: new ObjectId(id) },
    { $set: data }
  );
}

export async function deleteDocument(collectionName: string, id: string): Promise<any> {
  if (!isMongoConnected) throw new Error('Not connected');
  const { ObjectId } = await import('mongodb');
  return await mongoose.connection.db!.collection(collectionName).deleteOne({ _id: new ObjectId(id) });
}
