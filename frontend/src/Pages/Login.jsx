import React, { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import { Card } from "../Components/ui/Card";

import { Button } from "../Components/ui/Button";

import { Input } from "../Components/ui/Input";

import { Label } from "../Components/ui/Label";

import { Shield } from "lucide-react";



export default function Login() {

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState(null);

  const [loading, setLoading] = useState(false);

  const [isAdminLogin, setIsAdminLogin] = useState(false);

  const navigate = useNavigate();

  const { login, adminLogin, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isAdminLogin) {
        await adminLogin(email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-50 p-4">

      <Card className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl">

        <div className="p-6 sm:p-8">

          <div className="flex flex-col items-center mb-8">

            <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center mb-4 shadow-lg">

              <Shield className="w-8 h-8 text-white" />

            </div>

            <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>

            <p className="text-gray-600 mt-2">Login to continue to your College Hub</p>

          </div>

          {error && (

            <div className="bg-red-50 border-2 border-red-300 text-red-700 p-4 rounded-lg mb-4 text-center font-semibold">

              {error}

            </div>

          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="space-y-2">

              <Label className="text-gray-900 font-semibold">Email Address</Label>

              <Input

                type="email"

                value={email}

                onChange={(e) => setEmail(e.target.value)}

                required

                placeholder="your.email@example.com"

                className="bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all rounded-lg p-3"

              />

            </div>

            <div className="space-y-2">

              <Label className="text-gray-900 font-semibold">Password</Label>

              <Input

                type="password"

                value={password}

                onChange={(e) => setPassword(e.target.value)}

                required

                placeholder="••••••••"

                className="bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all rounded-lg p-3"

              />

            </div>

            <div className="flex items-center space-x-3 pt-2">

              <input

                type="checkbox"

                id="admin-login"

                checked={isAdminLogin}

                onChange={(e) => setIsAdminLogin(e.target.checked)}

                className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded cursor-pointer focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"

              />

              <Label htmlFor="admin-login" className="text-gray-700 font-medium cursor-pointer">Login as Admin</Label>

            </div>

            <Button

              type="submit"

              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all text-lg mt-6"

            >

              {loading ? 'Logging in...' : 'Login'}

            </Button>

          </form>

          <div className="text-center mt-6 pt-6 border-t border-gray-200">

            <p className="text-gray-700">

              Don't have an account?{" "}

              <a href="/register" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">

                Register Here

              </a>

            </p>

          </div>

        </div>

      </Card>

    </div>

  );

}