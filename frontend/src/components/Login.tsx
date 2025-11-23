import { useRef, useState } from "react";

import "../styles/components.css";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    const { login } = useAuth();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleLogin(isLogin: boolean) {
        setError('');
        setIsLoading(true);

        const username = usernameRef.current?.value || '';
        const password = passwordRef.current?.value || '';

        const error = await login(username, password, isLogin);

        if (error) {
            setError(error);
        }
        setIsLoading(false);
    }

    return (
        <div className="flex flex-col grow gap-14 justify-center items-center">
            <h1 className="text-4xl font-bold">Welcome To NANA Web</h1>
            <div className="p-6 gap-4 flex flex-col rounded-md border border-slate-300">
                <h1>Enter Your Credentials</h1>
                <div className="flex flex-col gap-2">
                    <input
                        ref={usernameRef}
                        className="txt-input"
                        type="text"
                        name="username"
                        placeholder="username"
                    />
                    <input
                        ref={passwordRef}
                        className="txt-input"
                        type="password"
                        name="password"
                        placeholder="password"
                    />
                    {error && <span className="error">{error}</span>}
                    <span className="flex justify-center gap-2">
                        <button className="basic-btn" type="submit" onClick={() => handleLogin(true)}>
                            {isLoading ? 'Loading...' : 'Login'}
                        </button>
                        <button className="basic-btn" type="submit" onClick={() => handleLogin(false)}>
                            {isLoading ? 'Loading...' : 'Register'}
                        </button>
                    </span>
                </div>
            </div>
        </div>
    )
}