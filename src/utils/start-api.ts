import { Server } from 'http';
import { connect as connectToMongoDB } from 'mongoose';

import { MONGODB_URI, NODE_ENV } from '@/config';
import { IStartApiOptions } from '@/types';
import { decideMongoDBURI } from '@/utils';

export default async function startAPI(
  api: Server,
  options: IStartApiOptions = {
    port: 3000,
    env: NODE_ENV || 'development',
  },
): Promise<void> {
  const { port, env } = options;

  try {
    await connectToMongoDB(MONGODB_URI || decideMongoDBURI(env), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    api.listen(port, () => {
      console.log(
        `Sunday's Fancy Todo API is running.\nPORT\t=>\t${port}\nENV\t=>\t${env.toUpperCase()}`,
      );
    });

    api.on('error', () => {
      api.close();
    });
  } catch (err) {
    console.error(err);
  }
}
