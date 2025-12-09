import React, { useState } from 'react';
import { Trophy, Shield, Edit2, Trash2, Plus, X, CheckCircle, AlertCircle, Award, Star, Crown, Flame } from 'lucide-react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL, useAuth } from '../../context/AuthContext';

export default function AdminHousesEnhanced() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [houseToDelete, setHouseToDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const queryClient = useQueryClient();

  const { data: houses = [], isLoading } = useQuery({
    queryKey: ['houses'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/houses`);
      return res.json();
    },
  });

  const { token } = useAuth();

  const createHouseMutation = useMutation({
    mutationFn: async (newHouse) => {
      const response = await fetch(`${API_URL}/houses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newHouse),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to create house');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['houses']);
      showToast('House created successfully!', 'success');
      setIsDialogOpen(false);
    },
    onError: (error) => {
      showToast(error.message, 'error');
    },
  });

  const updateHouseMutation = useMutation({
    mutationFn: async (updatedHouse) => {
      const response = await fetch(`${API_URL}/houses/${updatedHouse._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedHouse),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to update house');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['houses']);
      showToast('House updated successfully!', 'success');
      setIsDialogOpen(false);
    },
    onError: (error) => {
      showToast(error.message, 'error');
    },
  });

  const deleteHouseMutation = useMutation({
    mutationFn: async (houseId) => {
      const response = await fetch(`${API_URL}/houses/${houseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to delete house');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['houses']);
      showToast('House deleted successfully!', 'success');
    },
    onError: (error) => {
      showToast(error.message, 'error');
    },
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = (houseId) => {
    setHouseToDelete(houseId);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (houseToDelete) {
      deleteHouseMutation.mutate(houseToDelete);
      setIsDeleteConfirmOpen(false);
      setHouseToDelete(null);
    }
  };

  const HouseForm = ({ house }) => {
    const [formData, setFormData] = useState(
      house || { 
        name: '', 
        color: '#740001', 
        points: 0, 
        logo_url: '', 
        description: '' 
      }
    );

    const handleSubmit = (e) => {
      e.preventDefault();
      if (house) {
        updateHouseMutation.mutate(formData);
      } else {
        createHouseMutation.mutate(formData);
      }
    };

    return (
      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">House Name</label>
          <input 
            placeholder="Enter house name" 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">House Color</label>
          <div className="flex gap-3 items-center">
            <input 
              type="color" 
              value={formData.color} 
              onChange={(e) => setFormData({ ...formData, color: e.target.value })} 
              className="w-20 h-12 rounded-lg cursor-pointer bg-gray-800 border border-gray-700"
            />
            <input 
              type="text"
              placeholder="#740001" 
              value={formData.color} 
              onChange={(e) => setFormData({ ...formData, color: e.target.value })} 
              className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
            />
          </div>
          <div 
            className="w-full h-16 rounded-lg border-2 border-gray-700" 
            style={{ backgroundColor: formData.color }}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Points</label>
          <input 
            type="number" 
            placeholder="0" 
            value={formData.points} 
            onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })} 
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Logo URL</label>
          <input 
            placeholder="https://example.com/logo.png" 
            value={formData.logo_url} 
            onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })} 
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
          />
          {formData.logo_url && (
            <div className="mt-2 p-3 border border-gray-700 rounded-lg bg-gray-800/30">
              <p className="text-sm text-gray-400 mb-2">Logo Preview:</p>
              <img 
                src={formData.logo_url} 
                alt="Logo preview" 
                className="w-20 h-20 object-cover rounded-lg mx-auto"
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Description</label>
          <textarea 
            placeholder="House motto or description..." 
            value={formData.description} 
            onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
            rows={4}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none resize-none"
          />
        </div>

        <button 
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {house ? 'Update House' : 'Create House'}
        </button>
      </div>
    );
  };

  // Sort houses by points for leaderboard
  const sortedHouses = [...houses].sort((a, b) => b.points - a.points);
  const maxPoints = Math.max(...houses.map(h => h.points), 1);

  const getRankIcon = (index) => {
    switch(index) {
      case 0: return <Crown className="w-5 h-5 text-yellow-400" />;
      case 1: return <Award className="w-5 h-5 text-gray-400" />;
      case 2: return <Star className="w-5 h-5 text-orange-400" />;
      default: return <Shield className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl animate-slide-in ${
          toast.type === 'success' ? 'bg-green-500/90' : 'bg-red-500/90'
        } text-white backdrop-blur-sm`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700 shadow-2xl animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Confirm Delete</h3>
                <p className="text-gray-400 text-sm">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6">Are you sure you want to delete this house?</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              House Management
            </h1>
            <p className="text-gray-400">Manage house points and standings</p>
          </div>
          <button 
            onClick={() => { setSelectedHouse(null); setIsDialogOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/30"
          >
            <Plus className="w-5 h-5" />
            Add House
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 hover:bg-gray-800/70 transition-all">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <p className="text-gray-400 text-sm mb-1">Total Houses</p>
            <p className="text-3xl font-bold text-white">{houses.length}</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 hover:bg-gray-800/70 transition-all">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mb-3">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <p className="text-gray-400 text-sm mb-1">Total Points</p>
            <p className="text-3xl font-bold text-white">{houses.reduce((sum, h) => sum + h.points, 0)}</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 hover:bg-gray-800/70 transition-all">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-3">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <p className="text-gray-400 text-sm mb-1">Leading House</p>
            <p className="text-2xl font-bold text-white truncate">{sortedHouses[0]?.name || 'N/A'}</p>
          </div>
        </div>

        {/* Leaderboard View */}
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">House Cup Standings</h2>
          </div>
          
          <div className="space-y-4">
            {sortedHouses.map((house, index) => {
              const percentage = (house.points / maxPoints) * 100;
              return (
                <div 
                  key={house._id}
                  className="relative bg-gray-800/50 rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition-all group"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-700/50">
                      {getRankIcon(index)}
                    </div>
                    
                    {house.logo_url ? (
                      <img 
                        src={house.logo_url} 
                        alt={house.name}
                        className="w-12 h-12 rounded-lg object-cover border-2 border-gray-700"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    ) : (
                      <div 
                        className="w-12 h-12 rounded-lg border-2 border-gray-700"
                        style={{ backgroundColor: house.color }}
                      />
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-xl font-bold text-white">{house.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-white">{house.points}</span>
                          <span className="text-gray-400 text-sm">pts</span>
                        </div>
                      </div>
                      
                      <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: house.color
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {house.description && (
                    <p className="text-gray-400 text-sm italic ml-14 mb-3">"{house.description}"</p>
                  )}
                  
                  <div className="flex gap-2 ml-14">
                    <button 
                      onClick={() => { setSelectedHouse(house); setIsDialogOpen(true); }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(house._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 text-sm rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grid View of Houses */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {houses.map((house) => (
            <div 
              key={house._id}
              className="group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl overflow-hidden hover:border-gray-600 transition-all hover:shadow-2xl hover:scale-[1.02]"
              style={{ 
                boxShadow: `0 0 30px ${house.color}20`
              }}
            >
              <div 
                className="h-32 relative"
                style={{ 
                  background: `linear-gradient(135deg, ${house.color}40, ${house.color}80)`
                }}
              >
                {house.logo_url ? (
                  <img 
                    src={house.logo_url} 
                    alt={house.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                ) : null}
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <Shield className="w-16 h-16 text-white opacity-80" />
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-2xl font-bold text-white mb-2">{house.name}</h3>
                
                <div className="flex items-center gap-2 mb-4">
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white/20"
                    style={{ backgroundColor: house.color }}
                  />
                  <span className="text-gray-400 text-sm">{house.color}</span>
                </div>

                <div className="flex items-center gap-2 mb-4 p-3 bg-gray-900/50 rounded-lg">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="text-2xl font-bold text-white">{house.points}</span>
                  <span className="text-gray-400 text-sm">points</span>
                </div>

                {house.description && (
                  <p className="text-gray-400 text-sm line-clamp-3 mb-4 italic">
                    "{house.description}"
                  </p>
                )}

                <div className="flex gap-2">
                  <button 
                    onClick={() => { setSelectedHouse(house); setIsDialogOpen(true); }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(house._id)}
                    className="flex items-center justify-center px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full border border-gray-700 shadow-2xl my-8 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {selectedHouse ? 'Edit House' : 'Create New House'}
              </h2>
              <button 
                onClick={() => setIsDialogOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <HouseForm house={selectedHouse} />
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}