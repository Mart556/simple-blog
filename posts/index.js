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

const POSTS = [];

app.get("/get-posts", (_, res) => {
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

	console.log(newPost);

	POSTS.push(newPost);
	res.status(201).json(newPost);
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

const PORT = 3000;
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
