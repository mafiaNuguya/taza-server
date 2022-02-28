namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production';
    PORT?: number;
    CLIENT_ORIGIN?: string;
  }
}
