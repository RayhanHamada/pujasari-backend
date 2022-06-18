const constants = {
  IS_PROD: process.env.NODE_ENV === 'production',
  PORT: process.env.PORT || 4000,
  FIREBASE_CONFIG: process.env.FIREBASE_CONFIG,
};

export default constants;

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: string;
    PORT?: string;
    FIREBASE_CONFIG?: string;
  }
}
