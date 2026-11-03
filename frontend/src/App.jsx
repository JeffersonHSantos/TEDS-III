import { Route, Routes } from 'react-router-dom';
import Login from './Login';
import Home from './Home';
import Configs from './Configs';
import Cadastro from './Cadastro';
import Usuarios from './Usuarios';
import Folha from './Folha';
import Relatorios from './Relatorios';
import Funcionario from './Funcionario';
import { GuestRoute, ProtectedRoute } from '@/components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cadastro"
        element={
          <ProtectedRoute adminOnly>
            <Cadastro />
          </ProtectedRoute>
        }
      />
      <Route
        path="/usuarios"
        element={
          <ProtectedRoute adminOnly>
            <Usuarios />
          </ProtectedRoute>
        }
      />
      <Route
        path="/folha"
        element={
          <ProtectedRoute>
            <Folha />
          </ProtectedRoute>
        }
      />
      <Route
        path="/relatorios"
        element={
          <ProtectedRoute>
            <Relatorios />
          </ProtectedRoute>
        }
      />
      <Route
        path="/configs"
        element={
          <ProtectedRoute>
            <Configs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/funcionario"
        element={
          <ProtectedRoute>
            <Funcionario />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
