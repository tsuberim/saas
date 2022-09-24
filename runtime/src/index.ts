require('dotenv').config()
import yargs from 'yargs';

import Redis from 'ioredis';

import { Isolate } from 'isolated-vm';




async function main() {
    const code = 'Math.random()'

    const vm = new Isolate({memoryLimit: 8});
    const context = await vm.createContext({});
    const script = await vm.compileScript(code, {});
    await script.run(context, {timeout: 100});

    console.log('hello')
}


if (require.main === module) {
    yargs.argv;
    main()
}