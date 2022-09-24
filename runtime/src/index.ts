require('dotenv').config()
import yargs from 'yargs';

import Redis from 'ioredis';
import express from 'express';

import { Isolate } from 'isolated-vm';


const port = Number(process.env.PORT || '8080')

async function main() {
    const code = 'Math.random()'

    const vm = new Isolate({memoryLimit: 8});
    const context = await vm.createContext({});
    const script = await vm.compileScript(code, {});
    await script.run(context, {timeout: 100});

    console.log('hello')

    const app = express();
    app.use(express.json());

    app.get('/', (req, res) => {
        res.send('hello world')
    })

    app.listen(port);
}


if (require.main === module) {
    yargs.argv;
    main()
}