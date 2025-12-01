import { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    user: string | null;
    login: (username: string, password: string, isLogin: boolean) => Promise<string | null>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            setUser(JSON.parse(userData));
        }

        setIsLoading(false);
    }, []);

    async function login(username: string, password: string, isLogin: boolean): Promise<string | null> {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/${isLogin ? "login" : "register"}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);

            return null;
        } else {
            return data.message;
        }
    }

    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    }

    const value = {
        user,
        login,
        logout,
        isAuthenticated: Boolean(user),
        isLoading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
    return useContext<AuthContextType>(AuthContext)!;
}