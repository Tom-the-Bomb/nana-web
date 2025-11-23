
import Login from "./components/Login"
import Dashboard from "./components/Dashboard";
import { useAuth } from "./contexts/AuthContext";

import logo from './assets/logo.svg';

export default function App() {
    const { isAuthenticated, isLoading, logout } = useAuth();

    return (
        <div className="flex flex-col max-w-dvw min-h-dvh">
            <header className="flex justify-between p-3 font-bold text-xl">
                <img src={logo} alt="NANA WEB Logo" className="h-10 mt-2 ml-2"/>
                {isAuthenticated &&
                    <button
                        type="button"
                        className="h-10 font-medium text-sm bg-red-400 p-2 hover:bg-red-500 text-white rounded-sm"
                        onClick={logout}
                    >
                        Logout
                    </button>
                }
            </header>
            {isLoading
                ? <div>
                    Loading...
                </div>
                : isAuthenticated
                ? <Dashboard />
                : <Login />
            }
            <footer className="p-4 text-center text-sm text-slate-600">
                &copy; 2025 NANA WEB
            </footer>
        </div>
    )
}