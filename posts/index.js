import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();

app.use(
	cors({
		origin: "http://localhost:5173",
		optionsSuccessStatus: 200,
	})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const POSTS = [];

app.get("/get-posts", (_, res) => {
	res.json(POSTS);
});

app.post("/add-post", async (req, res) => {
	const { title, content } = req.body;
	if (!title || !content) {
		return res.status(400).json({ error: "Title and content are required." });
	}

	const newPost = {
		id: POSTS.length + 1,
		title,
		content,
		comments: [],
	};

	console.log(newPost);

	POSTS.push(newPost);

	// Emit event to event bus
	await axios
		.post("http://localhost:4000/events", {
			type: "PostCreated",
			data: newPost,
		})
		.catch((err) => console.error("Error sending event:", err.message));

	res.status(201).json(newPost);
});

app.delete("/delete-post/:id", async (req, res) => {
	const postId = parseInt(req.params.id, 10);
	const postIndex = POSTS.findIndex((p) => p.id === postId);

	if (postIndex === -1) {
		return res.status(404).json({ error: "Post not found." });
	}

	POSTS.splice(postIndex, 1);

	// Emit event to event bus
	await axios
		.post("http://localhost:4000/events", {
			type: "PostDeleted",
			data: { id: postId },
		})
		.catch((err) => console.error("Error sending event:", err.message));

	res.status(204).send();
});

app.post("/events", (req, res) => {
	const { type, data } = req.body;
	console.log("Posts service received event:", type);

	// Handle events from other services if needed
	if (type === "CommentCreated") {
		const { postId, id, text } = data;
		const post = POSTS.find((p) => p.id === postId);
		if (post) {
			post.comments.push({ id, postId, text });
		}
	} else if (type === "CommentDeleted") {
		const { postId, id } = data;
		const post = POSTS.find((p) => p.id === postId);
		if (post) {
			post.comments = post.comments.filter((c) => c.id !== id);
		}
	}

	res.status(200).send({ status: "OK" });
});

const PORT = 3000;
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
