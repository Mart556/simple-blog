import { Router } from "express";
import * as fs from "node:fs/promises";

const router = Router();

const POSTS = await fs
	.readFile("data/posts.json", "utf-8")
	.then((data) => JSON.parse(data));

router.get("/get-posts", (_, res) => {
	res.json(POSTS);
});

router.post("/add-post", (req, res) => {
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

	fs.writeFile("data/posts.json", JSON.stringify(POSTS), (err) => {
		if (err) {
			console.error("Error writing to file:", err);
			return res.status(500).json({ error: "Internal server error." });
		}

		res.status(201).json(newPost);
	});
});

router.delete("/delete-post/:id", (req, res) => {
	const postId = parseInt(req.params.id, 10);
	const postIndex = POSTS.findIndex((p) => p.id === postId);

	if (postIndex === -1) {
		return res.status(404).json({ error: "Post not found." });
	}

	POSTS.splice(postIndex, 1);

	fs.writeFile("data/posts.json", JSON.stringify(POSTS), (err) => {
		if (err) {
			console.error("Error writing to file:", err);
			return res.status(500).json({ error: "Internal server error." });
		}

		res.status(204).send();
	});
});

export default router;
