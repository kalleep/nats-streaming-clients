import * as STAN from 'node-nats-streaming';

import { config } from './config';

const node = process.argv[2];

const clientId = `sub_${node || 0}`;

const port = process.argv[3] || "14222";

const stan = STAN.connect(config.clusterId, clientId, { url: `${config.server}:${port}` });

stan.on("connect", () => {
	sub();
});

stan.on("error", error => {
	console.log(error);
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
		console.log("SUB message");
		console.log("Sequence number: %s", message.getSequence());
		console.log("message: %s", message.getData());
	});

};