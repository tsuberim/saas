require('dotenv').config()
import yargs from 'yargs';

import Redis from 'ioredis';
import express from 'express';

import { Isolate } from 'isolated-vm';


const port = Number(process.env.PORT || '8080');
const redisUrl = new URL(process.env.REDIS!)

async function main() {
    const redis = new Redis({
        keyPrefix: 'runtime:',
        username: redisUrl.username,
        password: redisUrl.password,
        host: redisUrl.hostname,
        port: Number(redisUrl.port)
    });

    const code = 'Math.random()'

    const vm = new Isolate({memoryLimit: 8});
    const context = await vm.createContext({});
    const script = await vm.compileScript(code, {});
    await script.run(context, {timeout: 100});

    console.log('hello')

    const app = express();
    app.use(express.json());

    app.get('/', async (req, res) => {
        await redis.incr('key');
        const value = await redis.get('key');
        res.send('hello world: ' + value)
    })

    app.listen(port);
}


if (require.main === module) {
    yargs.argv;
    main()
}