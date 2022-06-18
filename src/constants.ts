const constants = {
  IS_PROD: process.env.NODE_ENV === 'production',
  PORT: process.env.PORT || 4000,
};

export default constants;

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: string;
    PORT?: string;
  }
}
