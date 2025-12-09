import React, { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "../Components/ui/Card";
import { Badge } from "../Components/ui/Badge";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { API_URL, useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";


export default function VotingResultsPage() {
  const queryClient = useQueryClient();
  const socket = useSocket();
  const { token, user } = useAuth(); // Get token and user from useAuth

  const { data: results = [], isLoading: isLoadingResults } = useQuery({
    queryKey: ['voting-results', token], // Add token to queryKey
    queryFn: async () => {
        if (!token) { // If no token, don't fetch
            return [];
        }
        const res = await fetch(`${API_URL}/votes/results`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!res.ok) {
            throw new Error('Failed to fetch voting results');
        }
        const data = await res.json();
        console.log('Voting results raw data:', data); // Log raw data
        return Array.isArray(data) ? data : [];
    },
    enabled: !!token, // Only enable query if token exists
  });

  const { data: leaderPositions = [], isLoading: isLoadingPositions } = useQuery({
    queryKey: ['leaderPositions'],
    queryFn: async () => {
        const res = await fetch(`${API_URL}/leader-positions`);
        if (!res.ok) {
            throw new Error('Failed to fetch leader positions');
        }
        return await res.json();
    },
  });

  const filteredLeaderPositions = useMemo(() => {
    if (!user || !leaderPositions) return [];

    if (user.role === 'admin') {
      return leaderPositions;
    } else {
      return leaderPositions.filter(position =>
        !position.house_id || // Global position
        (user.house && position.house_id === user.house._id) // Position for user's house
      );
    }
  }, [user, leaderPositions]);

  useEffect(() => {
    if (socket) {
      socket.on('winnerDeclared', () => {
        console.log('Socket event: winnerDeclared received, invalidating queries.');
        queryClient.invalidateQueries(['voting-results']);
      });
      socket.on('resultsDeclared', () => {
        console.log('Socket event: resultsDeclared received, invalidating queries.');
        queryClient.invalidateQueries(['voting-results']);
      });

      return () => {
        socket.off('winnerDeclared');
        socket.off('resultsDeclared');
      };
    }
  }, [socket, queryClient, token]); // Add token to dependencies

  const getWinnerForPosition = (positionId) => {
    if (!Array.isArray(results)) {
      return null;
    }
    const resultForPosition = results.find(
      (result) => result._id === positionId
    );
    console.log(`Checking position ID: ${positionId}, result found:`, resultForPosition); // Log position check
    return resultForPosition || null;
  };

  console.log('Overall results state:', results); // Log overall results state

  return (
    <div className="min-h-screen px-6 py-8 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-3 tracking-tight">
            <Trophy className="w-12 h-12 inline-block mr-4 text-yellow-400" />
            Voting Results
          </h1>
          <p className="text-2xl text-green-400 font-semibold animate-pulse">
            Results Declared!
          </p>
        </motion.div>

    {isLoadingResults || isLoadingPositions ? (
          <div className="flex justify-center items-center h-64">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredLeaderPositions.length === 0 ? (
                <div className="col-span-full text-center text-lg text-gray-400">
                    No results available for your access level or house.
                </div>
            ) : (
                filteredLeaderPositions.map((position, index) => {
                  const positionResult = getWinnerForPosition(position._id);
                  const winner = positionResult?.winner;
                  console.log(`Rendering for ${position.title}, winner object:`, winner); // Log winner object

                  const winnerPhoto = winner?.photo
                    ? winner.photo
                    : "https://via.placeholder.com/150?text=No+Photo";

                  return (
                    <motion.div
                      key={position._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.15 }}
                    >
                      <Card className="glass-card p-6 border-gray-800/50 flex flex-col items-center text-center h-full">
                        <h2 className="text-2xl font-bold text-white mb-4">
                          {position.title}
                        </h2>
                        {winner && winner.full_name ? ( // Check for full_name to confirm winner data
                          <>
                            <img
                              src={winnerPhoto}
                              alt={winner.full_name}
                              className="w-32 h-32 rounded-full object-cover border-4 border-yellow-400 shadow-lg mb-4"
                            />
                            <p className="text-xl font-extrabold text-yellow-300 mb-2">
                              {winner.full_name}
                            </p>
                            {winner.house && (
                              <p className="text-lg text-gray-300 mb-2">House: {winner.house}</p>
                            )}
                            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                              WINNER
                            </Badge>
                          </>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-lg text-gray-400">
                              Winner not declared yet
                            </p>
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  );
                })
            )}
          </div>
        )}
      </div>
    </div>
  );
}