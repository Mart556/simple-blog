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

import postsRoutes from "./routes/posts.js";
app.use("/posts", postsRoutes);

const PORT = 3000;
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
