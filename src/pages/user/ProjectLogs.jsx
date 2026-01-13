import { useEffect, useState } from "react";
import { useParams,useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getProjectActivityLogsApi } from "../../api/activityLog.api";

const ProjectLogs = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();


  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchLogs = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const res = await getProjectActivityLogsApi(projectId, cursor);

      setLogs(prev => [...prev, ...res.data.logs]);
      setCursor(res.data.nextCursor);
      setHasMore(res.data.hasMore);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    } finally {
      setLoading(false);
    }
  };

  // First load
  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, [projectId]);

  return (
    <MainLayout>
      <div className="flex items-center gap-3 mb-4">
  <button
    onClick={() => navigate(-1)}
    className="px-3 py-1 border rounded hover:bg-gray-100 text-sm"
  >
    ← Back
  </button>

  <h1 className="text-2xl font-bold">Project Logs</h1>
</div>

      
      <h1 className="text-2xl font-bold mb-4">Project Logs</h1>

      {logs.length === 0 && !loading && (
        <p>No activity found</p>
      )}

      <div className="space-y-3">
        {logs.map((log, index) => (
          <div key={index} className="border rounded p-3 bg-white">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">{log.createdBy}</span>{" "}
              <span className="text-gray-500">
                ({new Date(log.createdAt).toLocaleString()})
              </span>
            </p>

            <p className="text-sm mt-1">
              <span className="font-medium">{log.type}</span>{" "}
              on <span className="font-medium">{log.taskTitle}</span>
            </p>

            {(log.oldValue || log.newValue) && (
              <p className="text-sm text-gray-600 mt-1">
                {log.oldValue && (
                  <>
                    <span className="line-through">{log.oldValue}</span>{" "}
                    →
                  </>
                )}{" "}
                {log.newValue}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Load More Button */}
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
        <p className="text-center text-gray-400 mt-4">
          No more logs
        </p>
      )}
    </MainLayout>
  );
};

export default ProjectLogs;
