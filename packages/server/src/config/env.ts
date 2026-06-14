import * as dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '3002', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_TYPE: process.env.DB_TYPE || 'sqlite',
  DB_PATH: process.env.DB_PATH || './db/dev.sqlite3.json',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  LLM_API_KEY: process.env.LLM_API_KEY || '',
  LLM_BASE_URL: process.env.LLM_BASE_URL || 'https://api.openai.com/v1',
  LLM_MODEL: process.env.LLM_MODEL || 'gpt-4o-mini',
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
  // Enterprise WeChat
  WECOM_CORP_ID: process.env.WECOM_CORP_ID || '',
  WECOM_AGENT_ID: process.env.WECOM_AGENT_ID || '',
  WECOM_SECRET: process.env.WECOM_SECRET || '',
  WECOM_CALLBACK_TOKEN: process.env.WECOM_CALLBACK_TOKEN || '',
  WECOM_ENCODING_AES_KEY: process.env.WECOM_ENCODING_AES_KEY || '',
};
