import * as NATS from 'nats';
import * as STAN from 'node-nats-streaming';
import { config } from './config';

const nats = NATS.connect({ servers: config.servers, encoding: "binary" });

const node = process.argv[2];

const clientId = `pub_${node || 0}`;

const stan = STAN.connect(config.clusterId, clientId, { nc: nats });

stan.on("connect", () => {
	console.log(`client: ${clientId} connected to nats server: ${(stan as any).nc.url.host}`);
	start(publish);
});

stan.on("reconnect", () => {
	console.log(`client: ${clientId} reconnected to nats server: ${(stan as any).nc.url.host}`)
})

stan.on("error", error => {
	console.log(error);
	cleanUp();
});

const sleep = (ms: number) => {
	return new Promise(resolve => {
		setTimeout(() => resolve(true), ms);
	})
}

const start = async (func) => {

	let i = 0;

	while(true) {

		func(i);

		i++;

		try {
			await sleep(2000);
		}
		catch(error) {
			break;
		}
	}

	cleanUp();
}

const publish = (i: number) => {

	stan.publish("hello", i.toString(), (err, guid) => {

		if(err) {
			console.log(err);
		} else {
			console.log(guid);
		}
	});
};

process.on("exit", () => {
	cleanUp();
});

process.on('SIGINT', () => {
	cleanUp();
});

const cleanUp = () => {
	stan.close();
	process.exit();
}


