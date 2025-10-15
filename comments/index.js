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

const COMMENTS = [];

app.get("/get-comments", (_, res) => {
	res.json(COMMENTS);
});

app.post("/add-comment", async (req, res) => {
	const { postId, text } = req.body;
	if (!postId || !text) {
		return res.status(400).json({ error: "Post ID and text are required." });
	}

	const newComment = {
		id: COMMENTS.length + 1,
		postId,
		text,
	};

	COMMENTS.push(newComment);

	// Emit event to event bus
	await axios
		.post("http://localhost:4000/events", {
			type: "CommentCreated",
			data: newComment,
		})
		.catch((err) => console.error("Error sending event:", err.message));

	res.status(201).json(newComment.id);
});

app.delete("/delete-comment/:id", async (req, res) => {
	const commentId = parseInt(req.params.id, 10);
	const comment = COMMENTS.find((c) => c.id === commentId);

	if (!comment) {
		return res.status(404).json({ error: "Comment not found." });
	}

	const commentIndex = COMMENTS.findIndex((c) => c.id === commentId);
	COMMENTS.splice(commentIndex, 1);

	// Emit event to event bus
	await axios
		.post("http://localhost:4000/events", {
			type: "CommentDeleted",
			data: { id: commentId, postId: comment.postId },
		})
		.catch((err) => console.error("Error sending event:", err.message));

	res.status(200).json({ message: "Comment deleted successfully." });
});

app.delete("/delete-comments/:id", async (req, res) => {
	const postId = parseInt(req.params.id, 10);
	const deletedComments = [];

	for (let i = COMMENTS.length - 1; i >= 0; i--) {
		if (COMMENTS[i].postId === postId) {
			deletedComments.push(COMMENTS[i].id);
			COMMENTS.splice(i, 1);
		}
	}

	// Emit events for each deleted comment
	for (const commentId of deletedComments) {
		await axios
			.post("http://localhost:4000/events", {
				type: "CommentDeleted",
				data: { id: commentId, postId },
			})
			.catch((err) => console.error("Error sending event:", err.message));
	}

	res
		.status(200)
		.json({ message: "Comment for the post deleted successfully." });
});

app.post("/events", (req, res) => {
	const { type, data } = req.body;
	console.log("Comments service received event:", type);

	// Handle events from other services if needed
	if (type === "PostDeleted") {
		const { id: postId } = data;
		// Remove all comments for deleted post
		for (let i = COMMENTS.length - 1; i >= 0; i--) {
			if (COMMENTS[i].postId === postId) {
				COMMENTS.splice(i, 1);
			}
		}
	}

	res.status(200).send({ status: "OK" });
});

const PORT = 3001;
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
