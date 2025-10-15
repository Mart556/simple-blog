import express from "express";
import axios from "axios";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const services = [
	"http://localhost:3000/events",
	"http://localhost:3001/events",
];

app.post("/events", async (req, res) => {
	const event = req.body;
	console.log("Event Received:", event.type);

	// Broadcast event to all services
	const promises = services.map((url) => {
		return axios.post(url, event).catch((err) => {
			console.error(`Failed to send event to ${url}:`, err.message);
		});
	});

	await Promise.all(promises);

	res.status(200).send({ status: "OK" });
});

app.listen(4000, () => {
	console.log("Event Bus listening on port 4000");
});
