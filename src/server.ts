import app from "./app";
import config from "./config/env";
import { initDb } from "./config/db";

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database
    await initDb();

    // Start server
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
