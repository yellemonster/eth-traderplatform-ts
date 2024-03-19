//
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import morgan from "morgan";
import express from "express";
import index_router from "./routes/index";
//
import { connectDB } from "../config/connectDB";
import { SocketIOServer } from "./Sockets";
//
//
const staticPath = path.join(__dirname, "../../client");
const dotenvPath = path.join(__dirname, "../../../config", ".env");
//
//
dotenv.config({ path: dotenvPath });
connectDB();
//
//
const app = express();
const server = app.listen(process.env.PORT);
const options = {
    cors: true,
    methods: ["GET", "POST"],
    origins: [process.env.SERVER_URL],
};
//
export const socketServer = new SocketIOServer(server, options);
socketServer.setupEventHandlers();
//
app.use(cors());
app.use(express.static(staticPath));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("tiny"));
//
app.use(index_router);
//
//
console.log("\n*** >>> Server: ", process.env.PORT);
