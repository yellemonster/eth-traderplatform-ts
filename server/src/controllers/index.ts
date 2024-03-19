//
import { Request, Response } from "express";
import { redisClient } from "../../config/connectDB";
//
// ===============================================================
// ---------------------------------------------------------------
//
export type ChatMsg = {
    channelName: string;
    address: string;
    alias: string;
    text: string;
};
//
export const user = (alias: string) => `user:${alias}`;
export const chatRoom = (channelName: string) => `chatroom:${channelName}`;
//
// ===============================================================
// ---------------------------------------------------------------
//
export async function test(req: Request, res: Response) {
    //
    const message = "Main landing page - server template - test check success";
    //
    res.status(200).send({ message, location: process.env.LOC });
}
//
//
export async function getMsgs(req: Request, res: Response) {
    //
    const roomKey = chatRoom(req.params.channelName);
    const messages = await redisClient.lRange(roomKey, 0, -1);
    const parsedMessages = messages.map((message: string) => JSON.parse(message));
    //
    res.status(200).send({ messages: parsedMessages });
}
export async function pushMsg(req: Request, res: Response) {
    //
    const payload = req.body;
    //
    const roomKey = chatRoom(payload.channelName);
    //
    const newMsg: ChatMsg = {
        channelName: payload.channelName,
        address: payload.address,
        alias: payload.alias,
        text: payload.text,
    };
    //
    await redisClient.rPush(roomKey, JSON.stringify(newMsg));
    //
    res.status(200).send({ msg: "Message sent" });
}
//
//
export async function getData(req: Request, res: Response) {
    //
    const data = await redisClient.get(req.params.key);
    //
    res.status(200).send({ data });
}
