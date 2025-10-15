import express from "express";
import cors from "cors";

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

app.post("/add-comment", (req, res) => {
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

	res.status(201).json(newComment);
});

app.delete("/delete-comment/:id", (req, res) => {
	const commentId = parseInt(req.params.id, 10);
	const commentIndex = COMMENTS.findIndex((c) => c.id === commentId);

	if (commentIndex === -1) {
		return res.status(404).json({ error: "Comment not found." });
	}

	COMMENTS.splice(commentIndex, 1);

	res.status(200).json({ message: "Comment deleted successfully." });
});

app.delete("/delete-comments/:id", (req, res) => {
	const postId = parseInt(req.params.id, 10);
	for (let i = COMMENTS.length - 1; i >= 0; i--) {
		if (COMMENTS[i].postId === postId) {
			COMMENTS.splice(i, 1);
		}
	}

	res
		.status(200)
		.json({ message: "Comment for the post deleted successfully." });
});

const PORT = 3001;
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
