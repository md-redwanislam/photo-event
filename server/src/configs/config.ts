import "dotenv/config";

// const getEnv = (key: string, required = true): string => {
//   const value = process.env[key];
//   if (required && (!value || value.trim() === "")) {
//     throw new Error(`Missing required environment variable: ${key}`);
//   }
//   return value ?? "";
// };

// const getNumberEnv = (
//   key: string,
//   required = true,
//   defaultValue?: number,
// ): number => {
//   const value = process.env[key];
//   if (!value || value.trim() === "") {
//     if (required) {
//       throw new Error(`Missing required environment variable: ${key}`);
//     }
//     return defaultValue ?? NaN;
//   }
//   const parsed = Number(value);
//   if (Number.isNaN(parsed)) {
//     throw new Error(`Invalid number for environment variable ${key}: ${value}`);
//   }
//   return parsed;
// };

interface AppConfig {
  port: number;
}

interface DBConfig {
  host: string | undefined;
  port: number | undefined;
  user: string | undefined;
  password: string | undefined;
  name: string | undefined;
  cert: string | undefined;
}

interface JWTConfig {
  secretKey: string | undefined;
  expiresIn: string | undefined;
  refresh_secretKey: string | undefined;
  refresh_expiresIn: string | undefined;
}

interface CorsConfig {
  origin: string | undefined;
}

interface LimitConfig {
  maxJsonSize: string | undefined;
}

interface LimiterConfig {
  requestTime: string | undefined;
  requestNumber: number;
}

interface CloudinaryConfig {
  cloudName: string | undefined;
  cloudinary_api_key: string | undefined;
  cloudinary_api_secret: string | undefined;
}

interface Config {
  app: AppConfig;
  db: DBConfig;
  jwtoken: JWTConfig;
  cors: CorsConfig;
  limit: LimitConfig;
  limiter: LimiterConfig;
  cloudinary: CloudinaryConfig;
}

const config: Config = {
  app: {
    port: Number(process.env.PORT || 8080),
  },
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    cert: process.env.MYSQL_CA_CERT,
  },
  cors: {
    origin: process.env.CLIENT_URL,
  },
  jwtoken: {
    secretKey: process.env.SECRET_KEY,
    expiresIn: process.env.JWT_EXPIRES_IN,
    refresh_secretKey: process.env.REFRESH_SECRET_KEY,
    refresh_expiresIn: process.env.REFRESH_JWT_EXPIRES_IN,
  },
  limit: {
    maxJsonSize: process.env.MAX_JSON_SIZE,
  },
  limiter: {
    requestTime: process.env.REQUEST_TIME,
    requestNumber: Number(process.env.REQUEST_NUMBER),
  },
  cloudinary: {
    cloudName: process.env.CLOUD_NAME,
    cloudinary_api_key: process.env.CLOUD_API_KEY,
    cloudinary_api_secret: process.env.CLOUD_API_SECRET,
  },
};

export default config;
