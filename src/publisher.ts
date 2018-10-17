import * as STAN from 'node-nats-streaming';
import { config } from './config';

const node = process.argv[2];

const clientId = `pub_${node || 0}`;

const port = process.argv[3] || "14222";

const stan = STAN.connect(config.clusterId, clientId, { url: `${config.server}:${port}` });

stan.on("connect", () => {
	console.log("stan connected");
	start(publish);
});

stan.on("error", error => {
	console.log(error);
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


