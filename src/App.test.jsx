import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Mock de Supabase antes de importar los componentes
vi.mock('./lib/supabase', () => {
  const mockSupabase = {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      insert: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'http://test.com/avatar.jpg' } })),
      })),
    },
  };
  return { supabase: mockSupabase };
});

// Mock de la API de servicios
vi.mock('./services/api', () => ({
  getAlumnos: vi.fn(() => Promise.resolve([])),
  getMisRutinas: vi.fn(() => Promise.resolve({})),
  getEntrenamientosSemanaActual: vi.fn(() => Promise.resolve([])),
  diasSemana: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  crearInvitacion: vi.fn(),
}));

// Importar después de los mocks
import HubProfesor from './components/profesor/HubProfesor';
import HubAlumno from './components/rutina/HubAlumno';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { supabase } from './lib/supabase';

// Helper para crear contexto de auth mockeado
const createMockAuthContext = (perfil, usuario = { id: 'test-user-id' }) => {
  return {
    usuario,
    perfil,
    cargando: false,
    esAlumno: perfil?.rol === 'alumno',
    esProfesor: perfil?.rol === 'profesor',
    login: vi.fn(),
    logout: vi.fn(),
    registro: vi.fn(),
    actualizarAvatar: vi.fn(),
  };
};

// Wrapper con providers
const renderWithProviders = (ui, { route = '/', mockAuth } = {}) => {
  // Configurar los mocks de Supabase según el estado de auth
  supabase.auth.getSession.mockResolvedValue({
    data: { session: mockAuth?.usuario ? { user: mockAuth.usuario } : null },
  });

  supabase.from.mockReturnValue({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn().mockResolvedValue({ data: mockAuth?.perfil, error: null }),
      })),
    })),
  });

  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  );
};

describe('Protección de rutas y roles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Usuario Profesor', () => {
    const mockProfesor = {
      id: 'profesor-123',
      nombre: 'German Profesor',
      email: 'german@test.com',
      rol: 'profesor',
    };

    it('debe ver el botón "+ Nuevo Alumno" en HubProfesor', async () => {
      // Configurar mock de sesión como profesor
      supabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: mockProfesor.id } } },
      });

      supabase.auth.onAuthStateChange.mockImplementation((callback) => {
        // Simular que hay sesión activa
        setTimeout(() => {
          callback('SIGNED_IN', { user: { id: mockProfesor.id } });
        }, 0);
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      supabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: mockProfesor, error: null }),
          })),
        })),
      });

      render(
        <MemoryRouter>
          <AuthProvider>
            <HubProfesor />
          </AuthProvider>
        </MemoryRouter>
      );

      // Esperar a que cargue y buscar el botón de nuevo alumno
      await waitFor(() => {
        const botonNuevoAlumno = screen.getByRole('button', { name: /nuevo alumno/i });
        expect(botonNuevoAlumno).toBeInTheDocument();
      }, { timeout: 3000 });

      // Verificar que el título de "Mis Alumnos" está visible (contenido exclusivo de profesor)
      expect(screen.getByText('Mis Alumnos')).toBeInTheDocument();
    });

    it('debe ver el título "Mis Alumnos" (contenido exclusivo de profesor)', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: mockProfesor.id } } },
      });

      supabase.auth.onAuthStateChange.mockImplementation(() => {
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      supabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: mockProfesor, error: null }),
          })),
        })),
      });

      render(
        <MemoryRouter>
          <AuthProvider>
            <HubProfesor />
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Mis Alumnos')).toBeInTheDocument();
      });
    });
  });

  describe('Usuario Alumno', () => {
    const mockAlumno = {
      id: 'alumno-456',
      nombre: 'Juan Alumno',
      email: 'juan@test.com',
      rol: 'alumno',
    };

    it('NO debe ver el botón "+ Nuevo Alumno" en su hub', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: mockAlumno.id } } },
      });

      supabase.auth.onAuthStateChange.mockImplementation(() => {
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      supabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: mockAlumno, error: null }),
          })),
        })),
      });

      render(
        <MemoryRouter>
          <AuthProvider>
            <HubAlumno />
          </AuthProvider>
        </MemoryRouter>
      );

      // Esperar a que cargue
      await waitFor(() => {
        // El alumno NO debe ver el botón de nuevo alumno
        const botonNuevoAlumno = screen.queryByRole('button', { name: /nuevo alumno/i });
        expect(botonNuevoAlumno).not.toBeInTheDocument();
      });
    });

    it('debe ver su contenido de rutinas (Tu semana de entrenamiento)', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: mockAlumno.id } } },
      });

      supabase.auth.onAuthStateChange.mockImplementation(() => {
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      supabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: mockAlumno, error: null }),
          })),
        })),
      });

      render(
        <MemoryRouter>
          <AuthProvider>
            <HubAlumno />
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        // El alumno debe ver su sección de semana de entrenamiento
        expect(screen.getByText('Tu semana de entrenamiento')).toBeInTheDocument();
      });
    });

    it('debe ver el saludo personalizado con su nombre', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: mockAlumno.id } } },
      });

      supabase.auth.onAuthStateChange.mockImplementation(() => {
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      supabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: mockAlumno, error: null }),
          })),
        })),
      });

      render(
        <MemoryRouter>
          <AuthProvider>
            <HubAlumno />
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        // Buscar el saludo (puede ser "¡Hola, Juan!" tomando el primer nombre)
        expect(screen.getByText(/¡Hola/i)).toBeInTheDocument();
      });
    });
  });

  describe('ProtectedRoute - Redirección por roles', () => {
    const mockProfesor = {
      id: 'profesor-123',
      nombre: 'German',
      email: 'german@test.com',
      rol: 'profesor',
    };

    const mockAlumno = {
      id: 'alumno-456',
      nombre: 'Juan',
      email: 'juan@test.com',
      rol: 'alumno',
    };

    it('profesor intentando acceder a ruta de alumno debe ser redirigido', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: mockProfesor.id } } },
      });

      supabase.auth.onAuthStateChange.mockImplementation((callback) => {
        setTimeout(() => {
          callback('SIGNED_IN', { user: { id: mockProfesor.id } });
        }, 0);
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      supabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: mockProfesor, error: null }),
          })),
        })),
      });

      const { container } = render(
        <MemoryRouter initialEntries={['/alumno']}>
          <AuthProvider>
            <ProtectedRoute requiredRole="alumno">
              <div data-testid="contenido-alumno">Contenido de Alumno</div>
            </ProtectedRoute>
          </AuthProvider>
        </MemoryRouter>
      );

      // Un profesor no debería ver el contenido de alumno
      await waitFor(() => {
        const contenidoAlumno = screen.queryByTestId('contenido-alumno');
        expect(contenidoAlumno).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('alumno intentando acceder a ruta de profesor debe ser redirigido', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: mockAlumno.id } } },
      });

      supabase.auth.onAuthStateChange.mockImplementation((callback) => {
        setTimeout(() => {
          callback('SIGNED_IN', { user: { id: mockAlumno.id } });
        }, 0);
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      supabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: mockAlumno, error: null }),
          })),
        })),
      });

      render(
        <MemoryRouter initialEntries={['/profesor']}>
          <AuthProvider>
            <ProtectedRoute requiredRole="profesor">
              <div data-testid="contenido-profesor">Contenido de Profesor</div>
            </ProtectedRoute>
          </AuthProvider>
        </MemoryRouter>
      );

      // Un alumno no debería ver el contenido de profesor
      await waitFor(() => {
        const contenidoProfesor = screen.queryByTestId('contenido-profesor');
        expect(contenidoProfesor).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('usuario sin autenticar debe ser redirigido al login', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
      });

      supabase.auth.onAuthStateChange.mockImplementation(() => {
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      render(
        <MemoryRouter initialEntries={['/alumno']}>
          <AuthProvider>
            <ProtectedRoute requiredRole="alumno">
              <div data-testid="contenido-protegido">Contenido Protegido</div>
            </ProtectedRoute>
          </AuthProvider>
        </MemoryRouter>
      );

      // Sin sesión, no debe mostrar contenido protegido
      await waitFor(() => {
        const contenidoProtegido = screen.queryByTestId('contenido-protegido');
        expect(contenidoProtegido).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });
});
