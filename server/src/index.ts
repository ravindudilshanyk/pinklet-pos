import "dotenv/config";
import app from "./app";

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`✓ Pinklet server running on port ${PORT}`);
  if (process.send) process.send("ready");
});
