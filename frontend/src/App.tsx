import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import LoanList from "./pages/LoanList";
import LoanForm from "./pages/LoanForm";
import Simulation from "./pages/Simulation";
import Login from "./pages/Login";
import { AuthProvider, useAuth } from "./context/AuthContext";

import { Skeleton } from "./components/ui/Skeleton";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
        <div className="hidden md:block w-64 p-4 bg-slate-900 border-r border-slate-800">
          <Skeleton className="h-8 w-32 mb-8 bg-slate-800" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full bg-slate-800" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-32 w-full mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function AppLink() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="loans" element={<LoanList />} />
        <Route path="loans/new" element={<LoanForm />} />
        <Route path="loans/edit/:id" element={<LoanForm />} />
        <Route path="simulation" element={<Simulation />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppLink />
    </AuthProvider>
  );
}

export default App;
