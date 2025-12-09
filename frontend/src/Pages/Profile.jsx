import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "../Components/ui/Card";
import { Button } from "../Components/ui/Button";
import { Input } from "../Components/ui/Input";
import { Label } from "../Components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/Select";
import { Badge } from "../Components/ui/Badge";
import { User, Mail, Phone, GraduationCap, Home, CheckCircle, Trophy, Edit2 } from "lucide-react";
import { motion } from "framer-motion";

const API_URL = "http://localhost:5000/api";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const queryClient = useQueryClient();

  // ✅ Get all houses
  const { data: houses = [] } = useQuery({
    queryKey: ['houses'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/houses`);
      return await res.json();
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // ✅ Get current user info
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        localStorage.removeItem('token');
        return null;
      }

      const userData = await res.json();

      if (userData && userData.house_id) {
        const houseRes = await fetch(`${API_URL}/houses/${userData.house_id}`);
        if (houseRes.ok) {
          const houseData = await houseRes.json();
          userData.house = houseData;
        }
      }

      return userData;
    },
    onSuccess: (data) => {
      if (data) {
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          branch: data.branch || '',
          year: data.year || '',
          house_id: data.house_id || '',
          enrollment_number: data.enrollment_number || '',
        });
      }
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // ✅ FIX 1: Get my votes - ACTUAL API CALL
  const { data: myVotes = [] } = useQuery({
    queryKey: ['my-votes-profile'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❌ No token found');
        return [];
      }

      try {
        console.log('📍 Fetching my votes...');
        const res = await fetch(`${API_URL}/votes/my-votes`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          console.error('❌ Failed to fetch votes:', res.status);
          return [];
        }

        const data = await res.json();
        console.log('✅ My votes fetched:', data.length);
        return data;
      } catch (err) {
        console.error('❌ Error fetching votes:', err);
        return [];
      }
    },
    enabled: !!user, // Only run when user exists
    staleTime: 0, 
    refetchOnWindowFocus: true,
  });

  // ✅ FIX 2: Get my registrations - ACTUAL API CALL
  const { data: myRegistrations = [] } = useQuery({
    queryKey: ['my-registrations-profile'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❌ No token found');
        return [];
      }

      try {
        console.log('📍 Fetching my registrations...');
        const res = await fetch(`${API_URL}/registrations/myregistrations`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          console.error('❌ Failed to fetch registrations:', res.status);
          return [];
        }

        const data = await res.json();
        console.log('✅ My registrations fetched:', data.length);
        return data;
      } catch (err) {
        console.error('❌ Error fetching registrations:', err);
        return [];
      }
    },
    enabled: !!user, // Only run when user exists
    staleTime: 0, 
    refetchOnWindowFocus: true,
  });

  // ✅ Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        throw new Error('Failed to update profile');
      }

      return res.json();
    },
    onSuccess: (updatedUser) => {
      setIsEditing(false);
      queryClient.invalidateQueries(['me']);
      alert("✅ Profile updated successfully!");
    },
    onError: (err) => {
      alert(`❌ Error: ${err.message}`);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfileMutation.mutateAsync(formData);
  };

  const userHouse = user?.house || houses.find(h => h._id === user?.house_id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            My Profile
          </h1>
          <p className="text-xl text-gray-600">Manage your account and preferences</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="bg-white border border-gray-200 p-6 lg:col-span-2 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-2 ${isEditing ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-2 rounded-lg font-semibold transition-all`}
              >
                <Edit2 className="w-4 h-4" />
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="text-gray-900 font-semibold">Full Name</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="bg-gray-50 border-2 border-gray-200 text-gray-900 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all p-3"
                  />
                </div>

                <div>
                  <Label className="text-gray-900 font-semibold">Phone Number</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="bg-gray-50 border-2 border-gray-200 text-gray-900 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all p-3"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-900 font-semibold">Branch</Label>
                    <Input
                      value={formData.branch}
                      onChange={(e) => setFormData({...formData, branch: e.target.value})}
                      className="bg-gray-50 border-2 border-gray-200 text-gray-900 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all p-3"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-900 font-semibold">Year</Label>
                    <Select
                      value={formData.year}
                      onValueChange={(value) => setFormData({...formData, year: value})}
                    >
                      <SelectTrigger className="bg-gray-50 border-2 border-gray-200 text-gray-900 rounded-lg focus:border-blue-500">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-gray-200 rounded-lg">
                        <SelectItem value="1st Year">1st Year</SelectItem>
                        <SelectItem value="2nd Year">2nd Year</SelectItem>
                        <SelectItem value="3rd Year">3rd Year</SelectItem>
                        <SelectItem value="4th Year">4th Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-900 font-semibold">House</Label>
                  <Select
                    value={formData.house_id}
                    onValueChange={(value) => setFormData({...formData, house_id: value})}
                  >
                    <SelectTrigger className="bg-gray-50 border-2 border-gray-200 text-gray-900 rounded-lg focus:border-blue-500">
                      <SelectValue placeholder="Select house" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-gray-200 rounded-lg">
                      {houses.map(house => (
                        <SelectItem key={house._id} value={house._id}>{house.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-gray-900 font-semibold">Enrollment Number</Label>
                  <Input
                    value={formData.enrollment_number}
                    onChange={(e) => setFormData({...formData, enrollment_number: e.target.value})}
                    className="bg-gray-50 border-2 border-gray-200 text-gray-900 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all p-3"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-lg shadow-md transition-all"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <User className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Full Name</p>
                    <p className="text-gray-900 font-semibold">{user?.full_name || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <Mail className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Email</p>
                    <p className="text-gray-900 font-semibold">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                  <Phone className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Phone</p>
                    <p className="text-gray-900 font-semibold">{user?.phone || 'Not set'}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                    <GraduationCap className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">Branch</p>
                      <p className="text-gray-900 font-semibold">{user?.branch || 'Not set'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200">
                    <GraduationCap className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">Year</p>
                      <p className="text-gray-900 font-semibold">{user?.year || 'Not set'}</p>
                    </div>
                  </div>
                </div>

                {userHouse && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                    <Home className="w-5 h-5 text-red-600" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 font-semibold">House</p>
                      <p className="text-gray-900 font-semibold">{userHouse.name}</p>
                    </div>
                    <div 
                      className="w-10 h-10 rounded-full shadow-md"
                      style={{ backgroundColor: userHouse.color }}
                    />
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Activity Stats */}
          <div className="space-y-6">
            <Card className="bg-white border border-gray-200 p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                Activity Stats
              </h3>

              <div className="space-y-3">
                {/* ✅ VOTES CAST */}
                <div className="text-center p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="text-3xl font-bold text-purple-700">
                    {myVotes.length}
                  </div>
                  <div className="text-sm text-purple-600 font-semibold">Votes Cast</div>
                  <div className="text-xs text-purple-500 mt-1">
                    {myVotes.length > 0 ? '✅ Updated' : '⏳ No votes yet'}
                  </div>
                </div>

                {/* ✅ EVENTS REGISTERED */}
                <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="text-3xl font-bold text-blue-700">
                    {myRegistrations.length}
                  </div>
                  <div className="text-sm text-blue-600 font-semibold">Events Registered</div>
                  <div className="text-xs text-blue-500 mt-1">
                    {myRegistrations.length > 0 ? '✅ Updated' : '⏳ No registrations yet'}
                  </div>
                </div>

                {/* ✅ HOUSE POINTS */}
                {userHouse && (
                  <div className="text-center p-4 rounded-lg bg-amber-50 border border-amber-200">
                    <Trophy className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-amber-700">
                      {userHouse.points || 0}
                    </div>
                    <div className="text-sm text-amber-600 font-semibold">House Points</div>
                  </div>
                )}
              </div>
            </Card>

            {/* Account Type */}
            <Card className="bg-white border border-gray-200 p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Account Type</h3>
              <Badge className={user?.role === 'admin'
                ? "bg-amber-100 text-amber-700 border border-amber-300 text-lg px-4 py-2 rounded-lg"
                : "bg-blue-100 text-blue-700 border border-blue-300 text-lg px-4 py-2 rounded-lg"
              }>
                {user?.role === 'admin' ? '👑 Admin' : '👤 Student'}
              </Badge>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}