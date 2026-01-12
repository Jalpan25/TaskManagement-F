import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getCommentsApi,
  createCommentApi,
} from "../../api/comment.api";

const TaskCommentsPage = () => {
  const { taskId } = useParams();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await getCommentsApi(taskId);
      setComments(res.data);
    } catch (err) {
      console.error("Failed to fetch comments", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!content.trim()) return;

    try {
      await createCommentApi(taskId, { content });
      setContent("");
      fetchComments(); // refresh comments
    } catch (err) {
      console.error("Failed to add comment", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Comments</h2>

      {/* Add Comment */}
      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          className="w-full border rounded p-2"
        />
        <button
          onClick={handleAddComment}
          disabled={!content.trim()}
          className="mt-2 bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50"
        >
          Add Comment
        </button>
      </div>

      {/* Comments List */}
      {loading ? (
        <p>Loading comments...</p>
      ) : comments.length === 0 ? (
        <p>No comments yet</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c, index) => (
            <li key={index} className="border p-3 rounded">
              <p className="text-sm text-gray-700">{c.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {c.authorName} •{" "}
                {new Date(c.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskCommentsPage;
