import type { onReadyAsyncHookHandler } from 'fastify';
import constants from 'src/constants';

export const onReady: onReadyAsyncHookHandler = async function () {
  this.listen(
    constants.PORT,
    process.env.NODE_ENV === 'production'
      ? process.env.HOST || '0.0.0.0'
      : 'localhost',
    (_err, addr) => {
      console.log(`server running on ${addr}`);
    }
  );
};
