import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trophy, Vote, CheckCircle, Crown, Users, Target,
  TrendingUp, Award, Star, Zap, Shield, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Alert, AlertDescription } from "../Components/ui/Alert";
import NominationForm from '../Components/voting/NominationForm';
import NominationCard from '../Components/voting/NominationCard';
import { Button } from '../Components/ui/Button';

export default function VotingPageEnhanced() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('voting');
  const [votedPositions, setVotedPositions] = useState([]);
  const [positions, setPositions] = useState([]);
  const [nominations, setNominations] = useState([]);
  const [voteCounts, setVoteCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user, token, BASE_URL } = useAuth();
  const socket = useSocket();

  const userHouseColor = user?.house?.color || '#3b82f6';

  // ✅ MAIN FUNCTION - Sab data fetch karne ke liye
  const fetchAllData = useCallback(async () => {
    if (!user || !token) {
      console.log('No user or token');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Step 1: Positions fetch karo
      console.log('📍 Fetching positions...');
      const positionsResponse = await fetch(`${BASE_URL}/api/leader-positions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!positionsResponse.ok) {
        throw new Error('Failed to fetch positions');
      }
      const positionsData = await positionsResponse.json();
      setPositions(positionsData);
      console.log('✅ Positions fetched:', positionsData.length);

      // Step 2: Nominations fetch karo
      console.log('📍 Fetching nominations...');
      const nominationsResponse = await fetch(`${BASE_URL}/api/nominations/approved`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!nominationsResponse.ok) {
        throw new Error('Failed to fetch nominations');
      }
      const nominationsData = await nominationsResponse.json();
      setNominations(nominationsData);
      console.log('✅ Nominations fetched:', nominationsData.length);

      // Step 3: Vote results fetch karo (vote counts aur winner info)
      console.log('📍 Fetching vote results...');
      const voteResultsResponse = await fetch(`${BASE_URL}/api/votes/results`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!voteResultsResponse.ok) {
        throw new Error('Failed to fetch vote results');
      }
      const voteResults = await voteResultsResponse.json();

      // ✅ Vote counts ko map mein rakho
      const counts = {};
      voteResults.forEach(positionResult => {
        if (positionResult.nominations && Array.isArray(positionResult.nominations)) {
          positionResult.nominations.forEach(nomination => {
            if (nomination && nomination._id) {
              counts[nomination._id] = nomination.vote_count || 0;
            }
          });
        }
      });
      setVoteCounts(counts);
      console.log('✅ Vote counts updated:', Object.keys(counts).length);

      // Step 4: My votes fetch karo
      console.log('📍 Fetching my votes...');
      const myVotesResponse = await fetch(`${BASE_URL}/api/votes/my-votes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!myVotesResponse.ok) {
        throw new Error('Failed to fetch my votes');
      }
      const myVotesData = await myVotesResponse.json();
      const myVotedPositions = myVotesData.map(vote => vote.position_id._id);
      setVotedPositions(myVotedPositions);
      console.log('✅ My voted positions:', myVotedPositions.length);

    } catch (err) {
      console.error('❌ Error loading data:', err);
      setError(err.message || 'Failed to load voting data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [user, token, BASE_URL]);

  // ✅ INITIAL LOAD - Page load hone par
  useEffect(() => {
    if (!user) {
      setError('Please log in to access voting.');
      setIsLoading(false);
      return;
    }

    if (!user.house) {
      setError('Please join a house to participate in voting.');
      setIsLoading(false);
      return;
    }

    fetchAllData();
  }, [user, fetchAllData]);

  // ✅ SOCKET LISTENERS - Real-time updates
  useEffect(() => {
    if (!socket) {
      console.log('⚠️ Socket not connected');
      return;
    }

    console.log('🔌 Setting up socket listeners...');

    // 1️⃣ Vote count updated
    socket.on('nominationVoteCountUpdated', ({ nominationId, voteCount }) => {
      console.log('🔄 Vote count updated:', { nominationId, voteCount });
      setVoteCounts(prevCounts => ({
        ...prevCounts,
        [nominationId]: voteCount
      }));
    });

    // 2️⃣ New nomination added
    socket.on('newNomination', (newNomination) => {
      console.log('➕ New nomination:', newNomination);
      setNominations(prevNominations => [...prevNominations, newNomination]);
    });

    // 3️⃣ MOST IMPORTANT - Results declared
    socket.on('resultsDeclared', ({ position_id, winner }) => {
      console.log('🏆 Results declared event received:', { position_id, winner });
      // Refetch all data to show updated winner
      fetchAllData();
    });

    // Cleanup
    return () => {
      socket.off('nominationVoteCountUpdated');
      socket.off('newNomination');
      socket.off('resultsDeclared');
    };
  }, [socket, fetchAllData]);

  // ✅ VOTE HANDLER
  const handleVote = async (nominationId, positionId) => {
    if (votedPositions.includes(positionId)) {
      alert('You have already voted for this position!');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nomination_id: nominationId, position_id: positionId })
      });

      if (response.ok) {
        setVotedPositions([...votedPositions, positionId]);
        alert('✅ Vote cast successfully!');
        // Refetch data to update counts
        fetchAllData();
      } else {
        const errorData = await response.json();
        alert(`❌ Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error casting vote:', error);
      alert('❌ An error occurred while casting your vote.');
    }
  };

  // ✅ DECLARE RESULTS HANDLER
  const handleDeclareResults = async (positionId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/votes/declare-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ position_id: positionId })
      });

      if (response.ok) {
        alert('✅ Results declared successfully!');
        // Refetch data immediately
        setTimeout(() => {
          fetchAllData();
        }, 500);
      } else {
        const errorData = await response.json();
        alert(`❌ Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error declaring results:', error);
      alert('❌ An error occurred while declaring results.');
    }
  };

  const totalVotesCast = votedPositions.length;
  const totalPositions = positions.length;
  const votingProgress = totalPositions > 0 ? (totalVotesCast / totalPositions) * 100 : 0;

  // ✅ NOT IN HOUSE CHECK
  if (!user || !user.house) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-50 p-6">
        <Alert variant="destructive" className="max-w-md bg-red-50 border-2 border-red-300">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-700">
            You are not in a house. Please join a house to participate in voting.
            <Button onClick={() => navigate('/profile-setup')} className="ml-2 px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white">
              Go to Profile Setup
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // ✅ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-50 p-6">
        <div className="text-gray-700 text-xl flex items-center gap-3">
          <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading voting data...
        </div>
      </div>
    );
  }

  // ✅ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-50 p-6">
        <Alert variant="destructive" className="max-w-md bg-red-50 border-2 border-red-300">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // ✅ MAIN RENDER
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white border border-gray-200 rounded-full p-1.5 flex space-x-1 shadow-md">
            <button
              onClick={() => setActiveTab('voting')}
              className={`px-6 py-2.5 text-sm font-bold rounded-full transition-all ${
                activeTab === 'voting'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Vote
            </button>
            <button
              onClick={() => setActiveTab('nominate')}
              className={`px-6 py-2.5 text-sm font-bold rounded-full transition-all ${
                activeTab === 'nominate'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Nominate
            </button>
          </div>
        </div>

        {/* VOTING TAB */}
        {activeTab === 'voting' && (
          <div className="space-y-8">
            {positions.length === 0 ? (
              <Alert className="bg-amber-50 border-2 border-amber-300 rounded-xl">
                <AlertCircle className="h-5 w-5 text-amber-700" />
                <AlertDescription className="text-amber-800 font-semibold">
                  No leadership positions available for voting. Please contact an admin.
                </AlertDescription>
              </Alert>
            ) : (
              positions.map((position) => {
                const positionNominations = nominations.filter(
                  n => n.position_id && n.position_id._id === position._id
                );
                const hasVoted = votedPositions.includes(position._id);

                return (
                  <div key={position._id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
                    {/* Position Header */}
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                      <h3 className="text-2xl font-bold text-gray-900">{position.title}</h3>
                      {user.role === 'admin' && (
                        <button
                          onClick={() => handleDeclareResults(position._id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold shadow-md transition-all"
                        >
                          Declare Results
                        </button>
                      )}
                    </div>

                    {/* Already Voted Alert */}
                    {hasVoted && (
                      <div className="mb-6 p-4 bg-green-50 border border-green-300 rounded-lg flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-700 font-semibold">You have voted for this position</span>
                      </div>
                    )}

                    {/* ✅ WINNER DISPLAY - SAHI TARIKA */}
                    {position.overallWinner && (
                      <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg flex items-center gap-3">
                        <Crown className="w-6 h-6 text-yellow-700" />
                        <div>
                          <span className="text-yellow-700 font-bold block">🏆 Winner Declared!</span>
                          <span className="text-yellow-800 font-semibold">
                            {position.overallWinner.user?.full_name || 'Loading...'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Nominations Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {positionNominations.length > 0 ? (
                        positionNominations.map((nomination, index) => (
                          <NominationCard
                            key={nomination._id}
                            nomination={nomination}
                            position={position}
                            onVote={() => handleVote(nomination._id, position._id)}
                            hasVoted={hasVoted}
                            canVote={!hasVoted}
                            voteCount={voteCounts[nomination._id] || 0}
                            index={index}
                            isWinner={nomination.isWinner}
                          />
                        ))
                      ) : (
                        <div className="col-span-full p-8 text-center bg-gray-50 rounded-lg">
                          <p className="text-gray-500 font-semibold">No nominees for this position yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* NOMINATE TAB */}
        {activeTab === 'nominate' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
            <NominationForm />
          </div>
        )}
      </div>
    </div>
  );
}