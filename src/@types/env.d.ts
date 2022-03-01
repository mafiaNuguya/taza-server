declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production';
    PORT: string;
    TOKEN_SECRET: string;
    TOKEN_NAME: string;
  }
}
