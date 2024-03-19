//
import { Router } from "express";
//
const router = Router();
//
import * as index from "../controllers";
//
//
// =============================================
router.get("/test", index.test);
router.get("/:key", index.getData);
//
router.get("/getMsgs/:channelName", index.getMsgs);
router.post("/pushMsg", index.pushMsg);
// =============================================
//
//
export default router;
