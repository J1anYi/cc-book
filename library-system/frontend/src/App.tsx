import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import MainLayout from './components/Layout/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Borrowings from './pages/Borrowings';
import AdminUsers from './pages/Admin/Users';
import AdminBooks from './pages/Admin/Books';
import AdminBorrowings from './pages/Admin/Borrowings';

function PrivateRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'librarian') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  const loadFromStorage = useAuthStore((state) => state.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="books" element={<Books />} />
          <Route path="borrowings" element={<Borrowings />} />
          <Route
            path="admin/users"
            element={
              <PrivateRoute adminOnly>
                <AdminUsers />
              </PrivateRoute>
            }
          />
          <Route
            path="admin/books"
            element={
              <PrivateRoute adminOnly>
                <AdminBooks />
              </PrivateRoute>
            }
          />
          <Route
            path="admin/borrowings"
            element={
              <PrivateRoute adminOnly>
                <AdminBorrowings />
              </PrivateRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
