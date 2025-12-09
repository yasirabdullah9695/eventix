import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "../Components/ui/Card";
import { Button } from "../Components/ui/Button";
import { Input } from "../Components/ui/Input";
import { Label } from "../Components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/Select";
import { motion } from "framer-motion";
import { Shield, User, GraduationCap, Home, Phone, AlertCircle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Alert, AlertDescription } from "../Components/ui/Alert";
import { useAuth } from "../context/AuthContext"; // Import useAuth



export default function ProfileSetupPage() {
  const { user, isAuthenticated, setUser } = useAuth(); // Use useAuth hook
  const [formData, setFormData] = useState({
    full_name: '',
    house_id: '',
    branch: '',
    year: '',
    phone: '',
    enrollment_number: ''
  });
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const { data: houses = [] } = useQuery({
    queryKey: ['houses'],
    queryFn: async () => {
        const res = await fetch(`http://localhost:5000/api/houses`);
        return await res.json();
    },
    initialData: [],
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(createPageUrl("Home"));
      return;
    }

    // If user is an admin, they don't need to complete this profile setup
    if (user?.role === 'admin') {
      navigate(createPageUrl("AdminDashboard"));
      return;
    }

    if (user) {
      // Check if all required fields are present in the user object from AuthContext
      if (user.house_id && user.branch && user.year && user.phone && user.enrollment_number && user.full_name) {
          navigate(createPageUrl("Home"));
      } else {
          setFormData({
              full_name: user.full_name || '',
              house_id: user.house_id || '',
              branch: user.branch || '',
              year: user.year || '',
              phone: user.phone || '',
              enrollment_number: user.enrollment_number || ''
          });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
          throw new Error("Failed to update profile");
        }
        return response.json();
    },
    onSuccess: (updatedUserData) => {
      // Update the user context with the new data
      setUser(updatedUserData);
      navigate(createPageUrl("Home"));
    },
    onError: (error) => {
      console.error("Profile update failed:", error);
      alert("Failed to update profile. Please try again.");
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.house_id || !formData.branch || !formData.year || !formData.phone || !formData.enrollment_number) {
      alert("Please fill all required fields");
      return;
    }

    await updateProfileMutation.mutateAsync(formData);
  };

  const selectedHouse = houses.find(h => h._id === formData.house_id);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full relative z-10"
      >
        <Card className="glass-card p-8 md:p-12 border-gray-800">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 flex items-center justify-center mx-auto mb-4"
            >
              <Shield className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-2">Complete Your Profile</h1>
            <p className="text-gray-400 text-lg">Join your house and start your journey!</p>
          </div>

          <Alert className="mb-6 bg-blue-500/10 border-blue-500/30">
            <AlertCircle className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-300">
              <strong>Important:</strong> Your house selection is permanent. Choose wisely!
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: House Selection */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <Label className="text-gray-300 text-lg mb-4 block flex items-center gap-2">
                    <Home className="w-5 h-5 text-purple-400" />
                    Select Your House *
                  </Label>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {houses.map((house) => (
                      <motion.div
                        key={house._id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFormData({...formData, house_id: house._id})}
                        className={`cursor-pointer p-6 rounded-xl border-2 transition-all ${
                          formData.house_id === house._id
                            ? 'border-white shadow-lg shadow-purple-500/50'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                        style={{
                          backgroundColor: formData.house_id === house._id 
                            ? `${house.color}20` 
                            : 'rgba(255,255,255,0.05)'
                        }}
                      >
                        <div className="flex items-center gap-4 mb-3">
                          <div 
                            className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold text-white"
                            style={{ backgroundColor: house.color }}
                          >
                            {house.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white">{house.name}</h3>
                            <p className="text-gray-400 text-sm">{house.description}</p>
                          </div>
                          {formData.house_id === house._id && (
                            <CheckCircle className="w-6 h-6 text-green-400" />
                          )}
                        </div>
                        <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-700">
                          <span className="text-gray-400">Current Points</span>
                          <span className="text-white font-bold text-lg">{house.points || 0}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {formData.house_id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 py-6 text-lg font-bold"
                    >
                      Continue to Personal Details →
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Step 2: Personal Details */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Selected House Summary */}
                {selectedHouse && (
                  <div className="glass-card p-4 rounded-xl border border-gray-700 flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white"
                      style={{ backgroundColor: selectedHouse.color }}
                    >
                      {selectedHouse.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-400 text-sm">Selected House</p>
                      <p className="text-white font-bold">{selectedHouse.name}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep(1)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Change
                    </Button>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300 flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-blue-400" />
                      Full Name
                    </Label>
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      required
                      className="bg-white/10 border-gray-700 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300 flex items-center gap-2 mb-2">
                      <Phone className="w-4 h-4 text-green-400" />
                      Phone Number *
                    </Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required
                      placeholder="+91 1234567890"
                      className="bg-white/10 border-gray-700 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300 flex items-center gap-2 mb-2">
                    <GraduationCap className="w-4 h-4 text-yellow-400" />
                    Enrollment Number *
                  </Label>
                  <Input
                    value={formData.enrollment_number}
                    onChange={(e) => setFormData({...formData, enrollment_number: e.target.value})}
                    required
                    placeholder="e.g., 2024CS001"
                    className="bg-white/10 border-gray-700 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300 mb-2 block">Branch/Department *</Label>
                    <Input
                      value={formData.branch}
                      onChange={(e) => setFormData({...formData, branch: e.target.value})}
                      required
                      placeholder="e.g., Computer Science"
                      className="bg-white/10 border-gray-700 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300 mb-2 block">Academic Year *</Label>
                    <Select
                      value={formData.year}
                      onValueChange={(value) => setFormData({...formData, year: value})}
                    >
                      <SelectTrigger className="bg-white/10 border-gray-700 text-white">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="1st Year">1st Year</SelectItem>
                        <SelectItem value="2nd Year">2nd Year</SelectItem>
                        <SelectItem value="3rd Year">3rd Year</SelectItem>
                        <SelectItem value="4th Year">4th Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 border-gray-700 text-white hover:bg-white/10"
                  >
                    ← Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 py-6 text-lg font-bold"
                  >
                    {updateProfileMutation.isPending ? "Saving..." : "Complete Setup ✓"}
                  </Button>
                </div>
              </motion.div>
            )}
          </form>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <div className={`w-3 h-3 rounded-full transition-all ${step >= 1 ? 'bg-purple-500' : 'bg-gray-700'}`} />
            <div className={`w-3 h-3 rounded-full transition-all ${step >= 2 ? 'bg-purple-500' : 'bg-gray-700'}`} />
          </div>
        </Card>
      </motion.div>
    </div>
  );
}