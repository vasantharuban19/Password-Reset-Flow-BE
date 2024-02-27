import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config()

mongoose.connect(`${process.env.DB_URL}`,{dbName:process.env.DB_NAME})
// console.log(process.env.DB_NAME);
export default mongoose