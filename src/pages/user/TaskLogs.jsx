import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getTaskActivityLogsApi } from "../../api/activityLog.api";

const TaskLogs = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchLogs = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const res = await getTaskActivityLogsApi(taskId, cursor);

          setLogs(prev => {
      const seen = new Set(prev.map(l => l.id));
      const uniqueNewLogs = res.data.logs.filter(l => !seen.has(l.id));
      return [...prev, ...uniqueNewLogs];
    });

      setCursor(res.data.nextCursor);
      setHasMore(res.data.hasMore);
    } catch (err) {
      console.error("Failed to fetch task logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLogs([]);
    setCursor(null);
    setHasMore(true);
    fetchLogs();
    // eslint-disable-next-line
  }, [taskId]);

  return (
    <MainLayout>
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1 border rounded hover:bg-gray-100 text-sm"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold">Task Activity Logs</h1>
      </div>

      {logs.length === 0 && !loading && <p>No activity found</p>}

      <div className="space-y-3">
        {logs.map((log, index) => (
          <div key={index} className="border rounded p-3 bg-white">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">{log.createdBy}</span>{" "}
              <span className="text-gray-500">
                ({new Date(log.createdAt).toLocaleString()})
              </span>
            </p>

            <p className="text-sm mt-1 font-medium">{log.type}</p>

            {(log.oldValue || log.newValue) && (
              <p className="text-sm text-gray-600 mt-1">
                {log.oldValue && (
                  <>
                    <span className="line-through">{log.oldValue}</span> →
                  </>
                )}{" "}
                {log.newValue}
              </p>
            )}
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {!hasMore && logs.length > 0 && (
        <p className="text-center text-gray-400 mt-4">No more logs</p>
      )}
    </MainLayout>
  );
};

export default TaskLogs;
