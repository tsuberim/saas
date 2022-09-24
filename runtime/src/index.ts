require('dotenv').config()
import yargs from 'yargs';

import Redis from 'ioredis';
import express from 'express';

import { Callback, Isolate } from 'isolated-vm';
import { MongoClient } from 'mongodb';


const port = Number(process.env.PORT || '8080');
const redisUrl = new URL(process.env.REDIS!)
const mongoUrl = process.env.MONGO!;

async function main() {
    const mongo = await MongoClient.connect(mongoUrl);
    const sys = mongo.db('sys');
    const projects = sys.collection('projects');

    const redis = new Redis({
        keyPrefix: 'runtime:',
        username: redisUrl.username,
        password: redisUrl.password,
        host: redisUrl.hostname,
        port: Number(redisUrl.port)
    });

    const app = express();
    app.use(express.json());

    const api = express.Router();
    api.post('/:uid/:project/:env', async (req, res) => {
        const { uid, project, env } = req.params;
        const { code } = req.body;
        const id = `${uid}-${project}-${env}`;

        await projects.updateOne({ _id: id }, { $set: { _id: id, uid, project, env, code } }, { upsert: true })

        res.send('OK');
    });
    app.use('/api', api);

    app.use('/user/:uid/:project/:env', async (req, res) => {
        const { uid, project, env } = req.params;

        try {
            const id = `${uid}-${project}-${env}`;
            const doc = await projects.findOne({ _id: id });

            if (!doc) {
                throw new Error(`Project ${id} not found`);
            }

            const code: string = doc.code;

            const vm = new Isolate({ memoryLimit: 8 });
            const context = await vm.createContext({});

            const script = await vm.compileScript(code, {});
            await script.run(context, { timeout: 100 });

            const result = await context.evalClosure('onReq($0, $1)', [req.method, req.body], {timeout: 100, arguments: {copy: true}, result: {copy: true}})

            vm.dispose();

            res.send({result});
        } catch (e) {
            res.status(400).send((e as any).message);
        }

    })

    app.listen(port);
}


if (require.main === module) {
    yargs.argv;
    main()
}