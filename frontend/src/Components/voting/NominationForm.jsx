import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import { Shield, User, Mail, Phone, GraduationCap, Home, Briefcase, FileText, Image as ImageIcon, AlertCircle, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "../ui/Alert";

export default function NominationForm({ eventId }) {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated, token, BASE_URL } = useAuth();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [photo, setPhoto] = useState(null);

  const [formData, setFormData] = useState({
    position_id: '',
    manifesto: '',
  });

  const { data: positions = [] } = useQuery({
    queryKey: ['leaderPositions'],
    queryFn: async () => {
        const res = await fetch(`${BASE_URL}/api/leader-positions`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) {
            throw new Error('Failed to fetch leader positions');
        }
        return await res.json();
    },
    initialData: [],
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [authUser, isAuthenticated, navigate]);

  const createNominationMutation = useMutation({
    mutationFn: async (newNomination) => {
      const response = await fetch(`${BASE_URL}/api/nominations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: newNomination,
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to create nomination');
      }
      return response.json();
    },
    onSuccess: () => {
      setSuccess("Nomination submitted successfully! Status: Pending approval.");
      setError(null);
      setFormData({
        position_id: '',
        manifesto: '',
      });
      setPhoto(null);
    },
    onError: (err) => {
      setError(err.message || "An unexpected error occurred.");
      setSuccess(null);
    },
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevData => ({ ...prevData, [id]: value }));
  };

  const handleFileChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleSelectChange = (id, value) => {
    setFormData(prevData => ({ ...prevData, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.position_id || !formData.manifesto) {
      setError("Please fill in all required fields, including the event ID.");
      return;
    }

    const nominationData = new FormData();
    nominationData.append('position_id', formData.position_id);
    nominationData.append('manifesto', formData.manifesto);

    if (photo) {
      nominationData.append('photo', photo);
    }

    createNominationMutation.mutate(nominationData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-50 p-4">
      <Card className="w-full max-w-3xl bg-white border border-gray-200 rounded-2xl shadow-lg">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Nominate Yourself</h1>
            <p className="text-gray-600 mt-2">Stand for a leadership position in your house!</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4 bg-red-50 border-2 border-red-300">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-4 bg-green-50 border-2 border-green-300">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 font-semibold">{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student_name" className="text-gray-900 font-semibold flex items-center gap-2"><User className="w-4 h-4 text-blue-600" /> Full Name</Label>
                <Input
                  type="text"
                  id="student_name"
                  value={authUser?.full_name || ''}
                  required
                  placeholder="Your Full Name"
                  className="bg-gray-50 border-2 border-gray-200 text-gray-900 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all p-3"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student_email" className="text-gray-900 font-semibold flex items-center gap-2"><Mail className="w-4 h-4 text-purple-600" /> Email</Label>
                <Input
                  type="email"
                  id="student_email"
                  value={authUser?.email || ''}
                  required
                  placeholder="your.email@example.com"
                  className="bg-gray-50 border-2 border-gray-200 text-gray-900 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all p-3"
                  disabled
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-900 font-semibold flex items-center gap-2"><Phone className="w-4 h-4 text-green-600" /> Phone</Label>
                <Input
                  type="text"
                  id="phone"
                  value={authUser?.phone || ''}
                  required
                  placeholder="123-456-7890"
                  className="bg-gray-50 border-2 border-gray-200 text-gray-900 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all p-3"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch" className="text-gray-900 font-semibold flex items-center gap-2"><GraduationCap className="w-4 h-4 text-yellow-600" /> Branch</Label>
                <Input
                  type="text"
                  id="branch"
                  value={authUser?.branch || ''}
                  required
                  placeholder="Computer Science"
                  className="bg-gray-50 border-2 border-gray-200 text-gray-900 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all p-3"
                  disabled
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year" className="text-gray-900 font-semibold flex items-center gap-2"><Calendar className="w-4 h-4 text-orange-600" /> Year</Label>
                <Input
                  type="text"
                  id="year"
                  value={authUser?.year || ''}
                  required
                  className="bg-gray-50 border-2 border-gray-200 text-gray-900 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all p-3"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="house" className="text-gray-900 font-semibold flex items-center gap-2"><Home className="w-4 h-4 text-red-600" /> House</Label>
                <Input
                  type="text"
                  id="house"
                  value={authUser?.house?.name || ''}
                  required
                  className="bg-gray-50 border-2 border-gray-200 text-gray-900 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all p-3"
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position_id" className="text-gray-900 font-semibold flex items-center gap-2"><Briefcase className="w-4 h-4 text-indigo-600" /> Position Applying For</Label>
              <Select onValueChange={(value) => handleSelectChange('position_id', value)} value={formData.position_id} required>
                <SelectTrigger id="position_id" className="bg-gray-50 border-2 border-gray-200 text-gray-900 rounded-lg focus:border-blue-500">
                  <SelectValue placeholder="Select Position" />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-gray-200 rounded-lg">
                  {positions.map(position => (
                    <SelectItem key={position._id} value={position._id}>{position.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manifesto" className="text-gray-900 font-semibold flex items-center gap-2"><FileText className="w-4 h-4 text-cyan-600" /> Manifesto</Label>
              <Textarea
                id="manifesto"
                value={formData.manifesto}
                onChange={handleChange}
                required
                placeholder="Tell us why you are a good fit for this position..."
                rows={5}
                className="bg-gray-50 border-2 border-gray-200 text-gray-900 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all p-3"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo" className="text-gray-900 font-semibold flex items-center gap-2"><ImageIcon className="w-4 h-4 text-pink-600" /> Photo</Label>
              <Input
                type="file"
                id="photo"
                onChange={handleFileChange}
                className="bg-gray-50 border-2 border-gray-200 text-gray-900 rounded-lg focus:border-blue-500 transition-all p-3"
              />
            </div>

            <Button
              type="submit"
              disabled={createNominationMutation.isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 rounded-lg shadow-md transition-all text-lg"
            >
              {createNominationMutation.isPending ? "Submitting..." : "Submit Nomination"}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}