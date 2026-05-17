declare global {
  interface Window {
    [key: string]: any;
  }

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      version: string;
    }
  }
}

export {};
