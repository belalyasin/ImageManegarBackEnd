const mongoose = require('mongoose');


const connectToDatabase = async ()=>{
    try {
        const client = await mongoose.connect(process.env.DB_URL,{useNewUrlParser:true, useUnifiedTopology: true});
        console.log(`Connected to MongoDB:${client.connection.host}`);
        // return db;
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error.message);
        process.exit(1);
    }
}

module.exports = connectToDatabase;
