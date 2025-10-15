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
			fetch(`http://localhost:3001/delete-comments/${postId}`, {
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

	const deleteComment = (commentId: number) => {
		fetch(`http://localhost:3001/delete-comment/${commentId}`, {
			method: "DELETE",
		})
			.then(() => {
				console.log(`Deleted comment ${commentId}`);
				setPosts((prevPosts) =>
					prevPosts.map((post) => ({
						...post,
						comments: post.comments.filter(
							(comment) => comment.id !== commentId
						),
					}))
				);
			})
			.catch((error) => {
				console.error("Error deleting comment:", error);
			});
	};

	return (
		<>
			<div className='flex-col text-center justify-center items-center h-screen w-screen overflow-x-hidden'>
				<h1 className='text-4xl font-bold text-white pt-5'>Blogi</h1>

				<div className='flex flex-col items-center justify-center pt-10'>
					<div className=' p-6 rounded-lg shadow-lg border border-gray-600 bg-radial from-gray-700 via-gray-800 to-black w-full max-w-md mx-auto'>
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
									className='w-full p-2 rounded border  bg-gray-800 text-white text-center border-b-2 border-gray-600'
								/>

								<input
									id='content'
									name='content'
									type='text'
									value={content}
									onChange={(e) => setContent(e.target.value)}
									required
									placeholder='Enter post content'
									className='w-full p-2 rounded border  bg-gray-800 text-white text-center border-b-2 border-gray-600'
								/>
							</div>

							<button
								type='submit'
								className='w-full bg-green-600 hover:bg-green-900 text-white py-2 rounded cursor-pointer transition-colors duration-300'
							>
								Create Post
							</button>
						</form>
					</div>
				</div>

				<div className='px-10 w-full max-w-4xl mx-auto'>
					<h2 className='text-3xl font-bold text-white pt-10'>Posts</h2>
					<hr className='border-gray-600 my-4' />
					<div className='mt-4 space-y-4 h-max-screen overflow-y-auto '>
						{posts.length === 0 && (
							<p className='text-gray-400'>No posts available. 🥲</p>
						)}

						{posts.map((post) => (
							<div
								key={post.id}
								className='p-4  rounded-lg shadow-lg text-left border-2 border-gray-700 bg-gray-900'
							>
								<div className='flex  items-center justify-between'>
									<h3 className='text-3xl font-bold text-white'>
										{post.title}
									</h3>
									<span
										role='button'
										aria-label={`Delete post ${post.title}`}
										className='cursor-pointer text-4xl text-gray-500 hover:text-red-500 pb-4 self-center leading-none'
										onClick={() => deletePost(post.id)}
									>
										&times;
									</span>
								</div>
								<p className='text-gray-300 mt-2 '>{post.content}</p>
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
													<div className='flex justify-between items-center'>
														<span className='text-gray-200'>
															{comment.text}
														</span>
														<span className='text-gray-500 text-sm'>
															Comment ID: {comment.id}
														</span>
														<span
															role='button'
															aria-label={`Delete comment ${comment.id}`}
															className='cursor-pointer text-red-500 hover:text-red-700 text-2xl'
															onClick={() => deleteComment(comment.id)}
														>
															&times;
														</span>
													</div>
												</li>
											))
										)}
									</ul>
									<button
										className='mt-4 bg-green-600 hover:bg-green-900 text-white py-1 px-3 rounded cursor-pointer transition-colors duration-300'
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
