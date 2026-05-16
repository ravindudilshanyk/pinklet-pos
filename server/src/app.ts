import express, { Request, Response } from "express";
const cors = require("cors");
import { errorMiddleware } from "./middleware/error.middleware";
import authRoutes from "./routes/auth.routes";
import itemRoutes from "./routes/items.routes";
import billingRoutes from "./routes/billing.routes";
import customerRoutes from "./routes/customers.routes";
import salesRoutes from "./routes/sales.routes";
import reportsRoutes from "./routes/reports.routes";
import settingsRoutes from './routes/settings.routes'

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/items", itemRoutes);
app.use("/api/v1/billing", billingRoutes);
app.use("/api/v1/customers", customerRoutes);
app.use("/api/v1/sales", salesRoutes);
app.use("/api/v1/reports", reportsRoutes);
app.use('/api/v1/settings', settingsRoutes)

app.get("/api/v1/health", (req: Request, res: Response) => {
  res.json({ success: true, data: "Pinklet server is running" });
});

app.use(errorMiddleware);

export default app;
