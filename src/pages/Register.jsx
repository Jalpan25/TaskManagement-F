import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { registerApi, loginApi } from "../api/auth.api";
import { isValidEmail, isStrongPassword } from "../utils/validation";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Name is required");
    if (!isValidEmail(email)) return setError("Invalid email");
    if (!isStrongPassword(password))
      return setError("Password must be strong");

    try {
      setLoading(true);

      await registerApi(name, email, password);
      const res = await loginApi(email, password);

      login(res.data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>

        {error && <p className="text-red-600 text-sm mb-3 text-center">{error}</p>}

        <input className="w-full mb-3 p-2 border rounded"
          placeholder="Name" value={name}
          onChange={(e) => setName(e.target.value)} />

        <input className="w-full mb-3 p-2 border rounded"
          placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} />

        <input className="w-full mb-4 p-2 border rounded"
          placeholder="Password" type="password" value={password}
          onChange={(e) => setPassword(e.target.value)} />

        <button disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded disabled:opacity-50">
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-sm text-center mt-3">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
