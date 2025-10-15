import React, { useEffect, useState } from "react";
import "./App.css";

type Post = {
	id: number;
	title: string;
	content?: string;
	comments: Comment[];
};

type Comment = {
	id: number;
	postId: number;
	text: string;
};

const App = () => {
	const [title, setTitle] = useState<string>("");
	const [content, setContent] = useState<string>("");

	const [posts, setPosts] = useState<Post[]>([]);

	const fetchPosts = async () => {
		try {
			const response = await fetch("http://localhost:3000/get-posts");
			const data: Post[] = await response.json();

			const commentsResponse = await fetch(
				"http://localhost:3001/get-comments"
			);

			const commentsData: Comment[] = await commentsResponse.json();

			const postsWithComments = data.map((post) => ({
				...post,
				comments: commentsData.filter((comment) => comment.postId === post.id),
			}));

			console.log("Fetched posts:", data);
			console.log("Fetched comments:", commentsData);

			setPosts(postsWithComments);
		} catch (error) {
			console.error("Error fetching posts:", error);
		}
	};

	useEffect(() => {
		fetchPosts();
	}, []);

	const createPost = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		try {
			const response = await fetch("http://localhost:3000/add-post", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ title, content }),
			});
			console.log(response.ok);
			if (response.ok) {
				const newPost: Post = await response.json();
				setPosts((prevPosts) => [...prevPosts, newPost]);
				setTitle("");
				setContent("");
			} else {
				console.error("Failed to create post");
			}
		} catch (error) {
			console.error("Error creating post:", error);
		}
	};

	const addComment = (postId: number, commentText: string) => {
		fetch(`http://localhost:3001/add-comment`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ postId, text: commentText }),
		}).then(() => {
			console.log(`Added comment to post ${postId}`);
			fetchPosts();
		});
	};

	const deletePost = (postId: number) => {
		fetch(`http://localhost:3000/delete-post/${postId}`, {
			method: "DELETE",
		}).then(() => {
			fetch(`http://localhost:3001/delete-comment/${postId}`, {
				method: "DELETE",
			})
				.then(() => {
					console.log(`Deleted comments for post ${postId}`);
					setPosts((prevPosts) =>
						prevPosts.filter((post) => post.id !== postId)
					);
				})
				.catch((error) => {
					console.error("Error deleting comments:", error);
				});
		});
	};

	return (
		<>
			<div className='flex-col text-center justify-center items-center h-screen w-screen overflow-x-hidden'>
				<h1 className='text-4xl font-bold text-white pt-5'>Blogi</h1>

				<div className='flex flex-col items-center justify-center pt-10'>
					<div className='bg-gray-800 p-6 rounded-lg shadow-lg'>
						<p className='text-white text-lg pb-4'>Create a new post</p>

						<form className='w-100' onSubmit={(e) => createPost(e)}>
							<div className='mb-4 space-y-4 text-center'>
								<input
									id='title'
									name='title'
									type='text'
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									required
									placeholder='Enter post title'
									className='w-full p-2 rounded border border-gray-600 bg-gray-700 text-white text-center'
								/>

								<input
									id='content'
									name='content'
									type='text'
									value={content}
									onChange={(e) => setContent(e.target.value)}
									required
									placeholder='Enter post content'
									className='w-full p-2 rounded border border-gray-600 bg-gray-700 text-white text-center'
								/>
							</div>

							<button
								type='submit'
								className='w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded '
							>
								Create Post
							</button>
						</form>
					</div>
				</div>

				<div className='px-10 w-full max-w-4xl mx-auto'>
					<h2 className='text-3xl font-bold text-white pt-10'>Posts</h2>
					<hr className='border-gray-600 my-4' />
					<div className='mt-4 space-y-4'>
						{posts.length === 0 && (
							<p className='text-gray-400'>No posts available. 🥲</p>
						)}

						{posts.map((post) => (
							<div
								key={post.id}
								className='bg-gray-800 p-6 rounded-lg shadow-lg text-left'
							>
								<div className='flex items-center justify-between'>
									<h3 className='text-xl font-bold text-white'>{post.title}</h3>
									<span
										role='button'
										aria-label={`Delete post ${post.title}`}
										className='cursor-pointer text-4xl text-gray-500 hover:text-red-500 pb-4 self-center leading-none'
										onClick={() => deletePost(post.id)}
									>
										&times;
									</span>
								</div>
								<p className='text-gray-300 mt-2'>{post.content}</p>
								<div className='mt-4'>
									<h4 className='text-lg font-semibold text-white'>Comments</h4>
									<div className='border border-gray-600 mb-2'></div>
									<ul className='mt-2 space-y-2'>
										{post?.comments.length === 0 ? (
											<li className='text-gray-400'>No comments yet. 🥲</li>
										) : (
											post.comments.map((comment) => (
												<li
													key={comment.id}
													className='bg-gray-700 p-2 rounded'
												>
													{comment.text}
												</li>
											))
										)}
									</ul>
									<button
										className='mt-4 bg-gray-600 hover:bg-gray-700 text-white py-1 px-3 rounded'
										onClick={() => {
											const commentText = prompt("Enter your comment:");
											if (commentText) {
												addComment(post.id, commentText);
											}
										}}
									>
										Add Comment
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</>
	);
};

export default App;
