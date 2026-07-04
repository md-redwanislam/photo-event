import app from "./app";
import config from "./configs/config";
import { testConnection } from "./configs/db";

const startServer = async (): Promise<void> => {
  try {
    await testConnection();

    app.listen(config.app.port, () => {
      console.log(`Server is running at http://localhost:${config.app.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
