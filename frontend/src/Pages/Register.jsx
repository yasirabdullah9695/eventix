import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Card } from "../Components/ui/Card";
import { Button } from "../Components/ui/Button";
import { Input } from "../Components/ui/Input";
import { Label } from "../Components/ui/Label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectScrollUpButton,
  SelectScrollDownButton,
  SelectGroup
} from "../Components/ui/Select";
import { Shield } from "lucide-react";

export default function Register() {
  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [enrollment_number, setEnrollmentNumber] = useState("");
  const [house_id, setHouseId] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const defaultHouses = [
    { _id: 'h1', name: 'Green House', color: '#10b981' },
    { _id: 'h2', name: 'Red House', color: '#ef4444' },
    { _id: 'h3', name: 'Blue House', color: '#3b82f6' },
    { _id: 'h4', name: 'Yellow House', color: '#f59e0b' }
  ];

  const { data: houses, isLoading: isLoadingHouses, error: housesError } = useQuery({
    queryKey: ['houses'],
    queryFn: async () => {
        const res = await fetch(`http://localhost:5000/api/houses`);
        if (!res.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await res.json();
        console.log('Fetched houses data:', data);
        return data;
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!full_name || !email || !password || !phone || !branch || !year || !enrollment_number || !house_id) {
      setError("All fields are required");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          full_name, 
          email, 
          password, 
          phone, 
          branch, 
          year, 
          enrollment_number, 
          house_id 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        window.location.href = "/";
      } else {
        setError(data.message || "Failed to register");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center p-4 py-6">
      <Card className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-lg p-4">
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center shadow-md">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Create Account</h1>
        </div>
        
        {error && (
          <div className="mb-3 p-2 bg-red-50 border-2 border-red-300 rounded-lg">
            <p className="text-red-700 font-semibold text-xs">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="space-y-1">
            <Label className="text-gray-900 font-semibold text-sm">Full Name *</Label>
            <Input
              type="text"
              value={full_name}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="John Doe"
              className="bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all rounded-lg p-1.5 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-gray-900 font-semibold text-sm">Email *</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your.email@example.com"
              className="bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all rounded-lg p-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-gray-900 font-semibold text-sm">Password *</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all rounded-lg p-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-gray-900 font-semibold text-sm">Phone *</Label>
              <Input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="9876543210"
                className="bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all rounded-lg p-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-900 font-semibold text-sm">Enrollment *</Label>
              <Input
                type="text"
                value={enrollment_number}
                onChange={(e) => setEnrollmentNumber(e.target.value)}
                required
                placeholder="2024CS001"
                className="bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all rounded-lg p-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-gray-900 font-semibold text-sm">Branch *</Label>
              <Input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                required
                placeholder="Computer Science"
                className="bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all rounded-lg p-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-900 font-semibold text-sm">Year *</Label>
              <Input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
                placeholder="2nd Year"
                className="bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all rounded-lg p-2 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-gray-900 font-semibold text-sm">House *</Label>
            <Select 
              onValueChange={setHouseId} 
              value={house_id}
              disabled={isLoadingHouses}
            >
              <SelectTrigger 
                className="bg-gray-50 border-2 border-gray-200 text-gray-900 rounded-lg focus:border-blue-500 text-sm"
              >
                <SelectValue placeholder={isLoadingHouses ? "Loading houses..." : "Select your house"} />
              </SelectTrigger>
              <SelectContent 
                className="bg-white border-2 border-gray-200 rounded-lg"
                position="popper"
              >
                <SelectGroup className="p-1">
                  {isLoadingHouses ? (
                    <SelectItem 
                      value="loading" 
                      disabled 
                      className="text-gray-500 py-2 px-3 text-sm"
                    >
                      Loading houses...
                    </SelectItem>
                  ) : housesError ? (
                    <SelectItem 
                      value="error" 
                      disabled 
                      className="text-red-600 py-2 px-3 text-sm"
                    >
                      Error loading houses
                    </SelectItem>
                  ) : !houses || houses.length === 0 ? (
                    <SelectItem 
                      value="none" 
                      disabled 
                      className="text-gray-500 py-2 px-3 text-sm"
                    >
                      No houses found
                    </SelectItem>
                  ) : (
                    houses.map(house => (
                      <SelectItem 
                        key={house._id} 
                        value={house._id}
                        className="relative flex items-center hover:bg-gray-100 rounded-sm py-2 px-3 text-sm text-gray-900 focus:bg-gray-100 cursor-pointer transition-all"
                      >
                        <div 
                          className="w-2.5 h-2.5 rounded-full mr-2 flex-shrink-0" 
                          style={{ backgroundColor: house.color }}
                        />
                        {house.name}
                      </SelectItem>
                    ))
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
            {!house_id && !isLoadingHouses && (
              <p className="text-red-600 text-xs font-semibold mt-0.5">Please select your house</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-2 rounded-lg shadow-md transition-all text-sm mt-3"
          >
            {isLoading ? 'Creating Account...' : 'Register'}
          </Button>
        </form>
        
        <div className="text-center mt-3 pt-3 border-t border-gray-200">
          <p className="text-gray-700 text-xs">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Login Here
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}