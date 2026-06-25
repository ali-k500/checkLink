import { Router, type IRouter } from "express";
import { statsStore } from "../lib/statsStore";

const router: IRouter = Router();

router.get("/stats", async (_req, res): Promise<void> => {
  const stats = statsStore.getStats();
  res.json(stats);
});

export default router;
