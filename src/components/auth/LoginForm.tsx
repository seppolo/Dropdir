import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

interface LoginFormProps {
  onSuccess: () => void;
  onRegisterClick: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onRegisterClick,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Username and password are required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Check if user exists with matching credentials
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .eq("password_hash", password)
        .single();

      if (error || !data) {
        setError("Invalid username or password");
        setIsLoading(false);
        return;
      }

      // Store user session
      localStorage.setItem(
        "auth_state",
        JSON.stringify({
          isLoggedIn: true,
          username: data.username,
        }),
      );

      // Set RLS policy parameter
      await supabase.rpc("set_claim", {
        claim: "username",
        value: username,
      });

      onSuccess();
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Username</label>
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          className="sketch-input"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Password</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          className="sketch-input"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium"
        disabled={isLoading}
      >
        {isLoading ? "Logging in..." : "Login"}
      </Button>

      <div className="text-center mt-4">
        <span className="text-sm text-muted-foreground">
          Don't have an account?{" "}
        </span>
        <Button
          variant="link"
          className="p-0 text-purple-500 hover:text-purple-700"
          onClick={onRegisterClick}
        >
          Register now
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
