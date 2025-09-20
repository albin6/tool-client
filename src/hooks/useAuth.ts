import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import { authApi } from "@/services/api/auth";
import {
  AuthState,
  User,
  LoginCredentials,
  SignupCredentials,
} from "@/types/auth";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  signup: (credentials: SignupCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const useAuthProvider = (): AuthContextType => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });
  const { toast } = useToast();

  const setLoading = (isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }));
  };

  const setError = (error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setAuth = useCallback((user: User | null, token: string | null) => {
    setState((prev) => ({
      ...prev,
      user,
      token,
      isAuthenticated: !!user && !!token,
      isLoading: false,
      error: null,
    }));

    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
    }
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const response = await authApi.login(credentials);

        if (response.success && response.data?.user && response.data?.token) {
          setAuth(response.data.user, response.data.token);
          if (response.data.refreshToken) {
            localStorage.setItem("refreshToken", response.data.refreshToken);
          }
          toast({
            title: "Welcome back!",
            description: "You have been successfully logged in.",
          });
          return true;
        } else {
          setError(response.message || "Login failed");
          toast({
            variant: "destructive",
            title: "Login failed",
            description:
              response.message ||
              "Please check your credentials and try again.",
          });
          return false;
        }
      } catch (error: any) {
        const errorMessage = error.message || "Login failed";
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Login failed",
          description: errorMessage,
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setAuth, toast]
  );

  const signup = useCallback(
    async (credentials: SignupCredentials): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const response = await authApi.signup(credentials);

        if (response.success) {
          toast({
            title: "Account created!",
            description: "Please check your email to verify your account.",
          });
          return true;
        } else {
          setError(response.message || "Signup failed");
          toast({
            variant: "destructive",
            title: "Signup failed",
            description: response.message || "Please try again.",
          });
          return false;
        }
      } catch (error: any) {
        const errorMessage = error.message || "Signup failed";
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Signup failed",
          description: errorMessage,
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAuth(null, null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    }
  }, [setAuth, toast]);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const user = await authApi.getCurrentUser();
        setAuth(user, token);
      } catch (error) {
        console.error("Auth initialization error:", error);
        setAuth(null, null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [setAuth]);

  return {
    ...state,
    login,
    signup,
    logout,
    clearError,
  };
};

export { AuthContext };
