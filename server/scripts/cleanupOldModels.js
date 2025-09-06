import mongoose from 'mongoose';
import 'dotenv/config';

// Cleanup script to remove old request collections after migration
const cleanupOldModels = async () => {
    try {
        console.log('Starting cleanup...');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        // Drop old collections
        const collections = ['patient_requests', 'requests'];
        
        for (const collectionName of collections) {
            try {
                const collection = mongoose.connection.db.collection(collectionName);
                const count = await collection.countDocuments();
                
                if (count > 0) {
                    console.log(`Dropping collection ${collectionName} with ${count} documents...`);
                    await collection.drop();
                    console.log(`Successfully dropped ${collectionName}`);
                } else {
                    console.log(`Collection ${collectionName} is already empty`);
                }
            } catch (error) {
                if (error.code === 26) {
                    console.log(`Collection ${collectionName} does not exist`);
                } else {
                    console.error(`Error dropping collection ${collectionName}:`, error.message);
                }
            }
        }
        
        console.log('Cleanup completed successfully!');
        
    } catch (error) {
        console.error('Cleanup failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

// Run cleanup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    cleanupOldModels();
}

export default cleanupOldModels;

