import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "../Components/ui/Card";
import { Trophy, TrendingUp, Award, Medal } from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const API_URL = "http://localhost:5000/api";

export default function LeaderboardPage() {
  const { data: houses = [] } = useQuery({
    queryKey: ['houses'],
    queryFn: async () => {
        const res = await fetch(`${API_URL}/houses`);
        return await res.json();
    },
    initialData: [],
  });

  const { data: events = [] } = useQuery({
    queryKey: ['completed-events'],
    queryFn: async () => {
        const res = await fetch(`${API_URL}/events`);
        const allEvents = await res.json();
        return allEvents.filter(event => event.status === 'completed');
    },
    initialData: [],
  });

  const rankedHouses = [...houses].sort((a, b) => (b.points || 0) - (a.points || 0));

  const chartData = rankedHouses.map(house => ({
    name: house.name,
    points: house.points || 0,
    color: house.color
  }));

  const getMedalIcon = (rank) => {
    if (rank === 0) return <Trophy className="w-8 h-8 text-yellow-500" />;
    if (rank === 1) return <Medal className="w-8 h-8 text-gray-500" />;
    if (rank === 2) return <Award className="w-8 h-8 text-orange-600" />;
    return <span className="text-2xl font-bold text-gray-500">#{rank + 1}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2 sm:mb-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-600" />
            </div>
            House Leaderboard
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">Real-time standings and performance analytics</p>
        </motion.div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {rankedHouses.slice(0, 3).map((house, index) => (
            <motion.div
              key={house._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className={
                index === 0 ? 'md:order-2' : 
                index === 1 ? 'md:order-1' : 
                'md:order-3'
              }
            >
              <Card className={`bg-white border border-gray-200 p-6 text-center relative overflow-hidden h-full flex flex-col justify-center rounded-2xl shadow-lg hover:shadow-xl transition-all ${
                index === 0 ? 'md:scale-110 ring-2 ring-yellow-300' : 'md:mt-8'
              }`}>
                <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: house.color }} />
                
                <div className="mb-4 flex justify-center">
                  {getMedalIcon(index)}
                </div>
                
                <div 
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white shadow-lg"
                  style={{ backgroundColor: house.color }}
                >
                  {house.logo_url ? (
                    <img src={house.logo_url} alt={house.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    house.name.charAt(0)
                  )}
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{house.name}</h3>
                <p className="text-gray-600 text-sm mb-4 flex-grow">{house.description}</p>
                
                <div className="text-center mt-auto pt-4 border-t border-gray-200">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {house.points || 0}
                  </div>
                  <div className="text-sm text-gray-600 font-semibold">Total Points</div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Complete Rankings */}
        <Card className="bg-white border border-gray-200 p-4 sm:p-6 mb-12 rounded-2xl shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Complete Rankings</h2>
          
          <div className="space-y-3 sm:space-y-4">
            {rankedHouses.map((house, index) => (
              <motion.div
                key={house._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-slate-50 to-gray-50 hover:from-blue-50 hover:to-purple-50 border border-gray-200 hover:border-gray-300 transition-all"
              >
                <div className="w-10 sm:w-12 text-center flex-shrink-0">
                  {index < 3 ? getMedalIcon(index) : <span className="text-lg sm:text-xl font-bold text-gray-600">#{index + 1}</span>}
                </div>
                
                <div 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold text-white flex-shrink-0 shadow-md"
                  style={{ backgroundColor: house.color }}
                >
                  {house.logo_url ? (
                    <img src={house.logo_url} alt={house.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    house.name.charAt(0)
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-base sm:text-lg font-bold text-gray-900 truncate">{house.name}</h4>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{house.description}</p>
                </div>
                
                <div className="text-right ml-2">
                  <div className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{house.points || 0}</div>
                  <div className="text-xs text-gray-600 font-semibold">points</div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 gap-6">
          {/* Points Distribution Chart */}
          <Card className="bg-white border border-gray-200 p-4 sm:p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart className="w-5 h-5 text-blue-600" />
              </div>
              Points Distribution
            </h3>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '2px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                  labelStyle={{ color: '#111827', fontWeight: 'bold' }}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                />
                <Bar dataKey="points" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}