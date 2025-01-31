"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import NavigationButton from "../NavigationButton";

export default function SignUpForm() {
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (res.ok) {
            setSuccess("✅ Account created! Redirecting to login...");
            setIsLoading(true);
            await signIn("credentials", { email: formData.email, password: formData.password, redirect: false });
            router.push("/wordmorph"); // Redirect to dashboard
        } else {
            setError(`❌ ${data.error || "Signup failed"}`);
        }
    };

    return (
        <div className="signup-container">
            <div className="header-container">
                {!isLoading &&
                    <NavigationButton text="BACK" path="/" classes="nav-button secondary-button" />
                }
                <h1>Create Account</h1>
            </div>
            {!isLoading ?
                <>
                    <div className="input-container">
                        <form onSubmit={handleSubmit}>
                            <input className="input-box" type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
                            <input className="input-box" type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                            <input className="input-box" type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                            <br />
                            <button className="button" type="submit">Sign Up</button>
                        </form>
                    </div>
                    {error && <p className="error-text">{error}</p>}
                    {success && <p className="success-text">{success}</p>}
                </>
                : <LoadingSpinner />
            }
        </div>
    );
}
