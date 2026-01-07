import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Redirect from "./pages/Redirect";
import UserDashboard from "./pages/user/UserDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCreateProject from "./pages/admin/AdminCreateProject";
import AdminEditProject from "./pages/admin/AdminEditProject";
import UserProjectTasks from "./pages/user/UserProjectTasks";

import Unauthorized from "./pages/Unauthorized";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Smart redirect after login */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Redirect />
              </ProtectedRoute>
            }
          />

          {/* User dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="USER">
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin dashboard */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
           {/* create project */}
          <Route
  path="/admin/projects/create"
  element={
    <ProtectedRoute role="ADMIN">
      <AdminCreateProject />
    </ProtectedRoute>
  }
/>

 {/* edit project */}
<Route
  path="/admin/projects/:id/edit"
  element={
    <ProtectedRoute role="ADMIN">
      <AdminEditProject />
    </ProtectedRoute>
  }
/>
<Route
  path="/dashboard"
  element={
    <ProtectedRoute role="USER">
      <UserDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/user/projects/:projectId"
  element={
    <ProtectedRoute role="USER">
      <UserProjectTasks />
    </ProtectedRoute>
  }
/>


        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
