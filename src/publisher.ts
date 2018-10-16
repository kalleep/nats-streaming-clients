import * as STAN from 'node-nats-streaming';
import { config } from './config';

const stan = STAN.connect(config.clusterId, "publisher", { url: "nats://localhost:4444" });

stan.on("connect", () => {
	console.log("connected")
	start();
});

stan.on("error", error => {
	console.log(error);
});

const sleep = (ms: number) => {
	return new Promise(resolve => {
		setTimeout(() => resolve(true), ms);
	})
}

const start = async () => {

	let i = 0;

	while(true) {

		publish(i);

		i++;

		try {
			await sleep(1000);
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
}

process.on("exit", () => {
	cleanUp();
})

process.on('SIGINT', () => {
	cleanUp();
});

const cleanUp = () => {
	stan.close();
	process.exit();
}


