import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

const POSTS = [];

app.use(
	cors({
		origin: "http://localhost:5173", // Adjust this to your frontend URL
		optionsSuccessStatus: 200,
	})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/get-posts", (req, res) => {
	res.json(POSTS);
});

app.post("/add-post", (req, res) => {
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
	POSTS.push(newPost);
	res.status(201).json(newPost);
});

app.post("/add-comment", (req, res) => {
	const { postId, text } = req.body;
	if (!postId || !text) {
		return res
			.status(400)
			.json({ error: "Post ID and comment text are required." });
	}

	const post = POSTS.find((p) => p.id === postId);
	if (!post) {
		return res.status(404).json({ error: "Post not found." });
	}

	const newComment = {
		id: post.comments.length + 1,
		text,
	};
	post.comments.push(newComment);
	res.status(201).json(newComment);
});

app.delete("/delete-post/:id", (req, res) => {
	const postId = parseInt(req.params.id, 10);
	const postIndex = POSTS.findIndex((p) => p.id === postId);

	if (postIndex === -1) {
		return res.status(404).json({ error: "Post not found." });
	}

	POSTS.splice(postIndex, 1);
	res.status(204).send();
});

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
