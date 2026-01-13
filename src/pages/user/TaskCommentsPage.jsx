import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

import {
  getCommentsApi,
  createCommentApi,
  updateCommentApi,
  deleteCommentApi,
} from "../../api/comment.api";

const TaskCommentsPage = () => {
  const { taskId } = useParams();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");

  /* ================= AUTH ================= */
  const getLoggedInUserId = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);
      return decoded.id;
    } catch {
      return null;
    }
  };

  const loggedInUserId = getLoggedInUserId();

  /* ================= FETCH COMMENTS ================= */
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

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  /* ================= ADD ================= */
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await createCommentApi(taskId, { content: newComment });
      setNewComment("");
      fetchComments();
    } catch (err) {
      console.error("Failed to add comment", err);
    }
  };

  /* ================= EDIT ================= */
  const startEdit = (comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  const handleUpdateComment = async (commentId) => {
    if (!editContent.trim()) return;

    try {
      await updateCommentApi(commentId, { content: editContent });
      cancelEdit();
      fetchComments();
    } catch (err) {
      console.error("Failed to update comment", err);
    }
  };

  /* ================= DELETE ================= */
  const handleDeleteComment = async (commentId) => {
    if (!commentId) return;

    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      await deleteCommentApi(commentId);
      fetchComments();
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Comments</h2>

      {/* ADD COMMENT */}
      <div className="mb-5">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="w-full border rounded p-2"
        />
        <button
          onClick={handleAddComment}
          disabled={!newComment.trim()}
          className="mt-2 bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50"
        >
          Add Comment
        </button>
      </div>

      {/* COMMENTS LIST */}
      {loading ? (
        <p>Loading comments...</p>
      ) : comments.length === 0 ? (
        <p>No comments yet</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="border p-3 rounded">
              {/* EDIT MODE */}
              {editingCommentId === c.id ? (
                <>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full border rounded p-2"
                  />
                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={() => handleUpdateComment(c.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-400 text-white px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-700">{c.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {c.authorName} •{" "}
                    {new Date(c.createdAt).toLocaleString()}
                  </p>

                  {/* AUTHOR ACTIONS */}
                  {c.authorId === loggedInUserId && (
                    <div className="flex gap-4 mt-2">
                      <button
                        onClick={() => startEdit(c)}
                        className="text-blue-600 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="text-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskCommentsPage;