//
//
import mongoose from "mongoose";
import { createClient } from "redis";
//
export var redisClient: any = null;
//
export async function connectDB() {
    //
    try {
        //
        //
        // Redis -----------------------------------------------------------------------------------------
        const { REDIS_USER, REDIS_PW, REDIS_IP, REDIS_PORT } = process.env;
        const WEB_REDIS_URL = `redis://${REDIS_USER}:${REDIS_PW}@${REDIS_IP}:${REDIS_PORT}`;
        const LOCAL_REDIS_URL = `redis://${REDIS_IP}:${REDIS_PORT}`;
        const REDIS_URL =
            process.env.NODE_ENV === "production" ? WEB_REDIS_URL : LOCAL_REDIS_URL;
        //
        redisClient = createClient({ url: REDIS_URL });
        //
        await redisClient.connect();
        //
        console.log(`*** >>> Redis: ${REDIS_IP}:${REDIS_PORT}`);
        //
    } catch (error) {
        //
        console.log("Redis connection error - ", error);
    }
    //
    //
    try {
        //
        // Mongo -----------------------------------------------------------------------------------------
        const { MONGO_USER, MONGO_PW, MONGO_IP, MONGO_PORT, MONGO_DB } = process.env;
        //
        const WEB_MONGO_URL = `mongodb://${MONGO_USER}:${MONGO_PW}@${MONGO_IP}:${MONGO_PORT}/${MONGO_DB}`;
        const LOCAL_MONGO_URL = `mongodb://127.0.0.1:${MONGO_PORT}/${MONGO_DB}`;
        const MONGO_URL =
            process.env.NODE_ENV === "production" ? WEB_MONGO_URL : LOCAL_MONGO_URL;
        //
        await mongoose.connect(MONGO_URL, {});
        //
        console.log(`*** >>> Mongo: ${MONGO_IP}:${MONGO_PORT}/${MONGO_DB}\n`);
        //
    } catch (error) {
        //
        console.log("Mongo connection error - ", error);
    }
}
