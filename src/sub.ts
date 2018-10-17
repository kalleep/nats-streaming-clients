import * as NATS from 'nats';
import * as STAN from 'node-nats-streaming';

import { config } from './config';

const nats = NATS.connect({ servers: config.servers, encoding: "binary" });

const node = process.argv[2];

const clientId = `sub_${node || 0}`;

const stan = STAN.connect(config.clusterId, clientId, { nc: nats });

stan.on("connect", () => {
	console.log(`client: ${clientId} connected to nats server: ${(stan as any).nc.url.host}`);
	sub();
});

stan.on("reconnect", () => {
	console.log(`client: ${clientId} reconnected to nats server: ${(stan as any).nc.url.host}`)
})

stan.on("error", error => {
	console.log(error);
	cleanUp();
});

process.on("exit", () => {
	cleanUp();
})

process.on("SIGINT", () => {
	cleanUp();
});

const cleanUp = () => {
	stan.close();
	process.exit();
}

const sub = () => {

	const opts = stan.subscriptionOptions().setDeliverAllAvailable().setDurableName("durable");

	const subscription = stan.subscribe("hello", "sub", opts);

	subscription.on("message", (message: STAN.Message) => {
		console.log("Sequence number: %s", message.getSequence());
		console.log("message: %s", message.getData());
	});

};