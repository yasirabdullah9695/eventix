import React, { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth, API_URL, BASE_URL } from '../../context/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/Select';
import { RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminNominations() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [selectedHouseId, setSelectedHouseId] = React.useState(''); // State for selected house filter

  const { data: houses, isLoading: isLoadingHouses, isError: isErrorHouses } = useQuery({
    queryKey: ['houses'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/houses`);
      if (!res.ok) {
        throw new Error('Failed to fetch houses');
      }
      return res.json();
    },
  });

  const { data: nominations, isLoading, isError, refetch } = useQuery({
    queryKey: ['nominations', selectedHouseId], // Add selectedHouseId to queryKey
    queryFn: async () => {
            const url = selectedHouseId && selectedHouseId !== 'all'
              ? `${API_URL}/nominations?houseId=${selectedHouseId}`
              : `${API_URL}/nominations`;      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch nominations');
      }
      return res.json();
    },
    enabled: !!token && !isLoadingHouses, // Ensure houses are loaded before fetching nominations
  });

  const updateNominationMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const url = `${API_URL}/nominations/${id}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to update nomination');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['nominations']);
      toast.success('Nomination status updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteNominationMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`${API_URL}/nominations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to delete nomination');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['nominations']);
      toast.success('Nomination deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const declareWinnerMutation = useMutation({
    mutationFn: async ({ id, houseId }) => { // Accept houseId here
      const response = await fetch(`${API_URL}/admin/nominations/${id}/declare-winner?houseId=${houseId}`, { // Pass houseId as query param
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to declare winner');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['nominations']);
      queryClient.invalidateQueries(['voting-results']);
      toast.success('Winner declared successfully!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetMutation = useMutation({
    mutationFn: async ({ positionId, houseId }) => { // Accept houseId here
      const url = houseId 
        ? `${API_URL}/votes/results/${positionId}?houseId=${houseId}`
        : `${API_URL}/votes/results/${positionId}`; // Pass houseId as query param
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to reset results');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['nominations']);
      queryClient.invalidateQueries(['voting-results']);
      toast.success('Results reset successfully!');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleUpdateStatus = (id, status) => {
    updateNominationMutation.mutate({ id, status });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this nomination?')) {
      deleteNominationMutation.mutate(id);
    }
  };

  const handleDeclareWinner = (id, houseId) => { // Accept houseId
    if (window.confirm('Are you sure you want to declare this nomination as the winner?')) {
      declareWinnerMutation.mutate({ id, houseId }); // Pass houseId
    }
  };

  const handleResetResults = (positionId, houseId) => { // Accept houseId
    if (window.confirm('Are you sure you want to reset the results for this position? This will delete all votes.')) {
      resetMutation.mutate({ positionId, houseId }); // Pass houseId
    }
  };

  const groupedNominations = useMemo(() => {
    if (!nominations) return {};
    return nominations.reduce((acc, nomination) => {
      if (!nomination.position_id) {
        // Optionally log or handle nominations without a position_id
        console.warn('Nomination found without position_id:', nomination);
        return acc; 
      }
      const positionTitle = nomination.position_id.title;
      if (!acc[positionTitle]) {
        acc[positionTitle] = {
          position_id: nomination.position_id._id,
          nominations: [],
        };
      }
      acc[positionTitle].nominations.push(nomination);
      return acc;
    }, {});
  }, [nominations]);

  if (isLoading || isLoadingHouses) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg">Loading nominations...</p>
        </div>
      </div>
    );
  }

  if (isError || isErrorHouses) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">⚠️ Error loading nominations</p>
          <Button onClick={() => refetch()} className="bg-yellow-500 hover:bg-yellow-600">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 mb-2">
          Manage Nominations
        </h1>
        <p className="text-gray-400 text-lg">Review, approve, and manage all nominations</p>
        <div className="mt-4 w-full md:w-1/3">
          <Select onValueChange={setSelectedHouseId} value={selectedHouseId}>
            <SelectTrigger className="w-full bg-gray-800/50 border-gray-700 text-white">
              <SelectValue placeholder="Filter by House" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="all">All Houses</SelectItem>
              {houses?.map(house => (
                <SelectItem key={house._id} value={house._id}>
                  {house.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {Object.keys(groupedNominations).length === 0 ? (
        <Card className="glass-card border-gray-800/50">
          <div className="p-12 text-center">
            <p className="text-gray-400 text-xl">No nominations yet</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedNominations).map(([positionTitle, data]) => (
            <Card key={data.position_id} className="glass-card border-gray-800/50 overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-b border-gray-800/50 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">{positionTitle}</h2>
                    <p className="text-gray-400">{data.nominations.length} nomination{data.nominations.length !== 1 ? 's' : ''}</p>
                  </div>
                  <Button
                    onClick={() => handleResetResults(data.position_id, selectedHouseId)}
                    className="bg-red-500/90 hover:bg-red-600 text-white shadow-lg hover:shadow-red-500/20 transition-all duration-200"
                    disabled={resetMutation.isLoading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${resetMutation.isLoading ? 'animate-spin' : ''}`} />
                    Reset Results
                  </Button>
                </div>
              </div>

              <div className="p-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-800/50 hover:bg-transparent">
                        <TableHead className="text-gray-400 font-semibold">Photo</TableHead>
                        <TableHead className="text-gray-400 font-semibold">Candidate</TableHead>
                        <TableHead className="text-gray-400 font-semibold">House</TableHead>
                        <TableHead className="text-gray-400 font-semibold">Manifesto</TableHead>
                        <TableHead className="text-gray-400 font-semibold">Status</TableHead>
                        <TableHead className="text-gray-400 font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.nominations.map((nomination) => (
                        <TableRow key={nomination._id} className="border-gray-800/50 hover:bg-white/5 transition-colors">
                          <TableCell>
                            {nomination.photo ? (
                              <img 
                                src={`${BASE_URL}${nomination.photo}`} 
                                alt={nomination.user_id.full_name} 
                                className="w-16 h-16 object-cover rounded-lg border-2 border-gray-700/50 shadow-lg" 
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center border-2 border-gray-700/50">
                                <span className="text-gray-400 text-xs">No photo</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-white">{nomination.user_id.full_name}</div>
                          </TableCell>
                          <TableCell>
                            {nomination.house && (
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: nomination.house.color }}
                                />
                                <span className="text-gray-300">{nomination.house.name}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs text-gray-300 line-clamp-2">{nomination.manifesto}</div>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                              nomination.status === 'approved' 
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                : nomination.status === 'rejected'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : nomination.status === 'winner'
                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                            }`}>
                              {nomination.status === 'winner' ? '👑 Winner' : nomination.status.charAt(0).toUpperCase() + nomination.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2 flex-wrap">
                              {nomination.status === 'pending' && (
                                <>
                                  <Button 
                                    onClick={() => handleUpdateStatus(nomination._id, 'approved')} 
                                    size="sm" 
                                    className="bg-green-500/90 hover:bg-green-600 text-white shadow-lg hover:shadow-green-500/20 transition-all"
                                  >
                                    ✓ Approve
                                  </Button>
                                  <Button 
                                    onClick={() => handleUpdateStatus(nomination._id, 'rejected')} 
                                    size="sm" 
                                    className="bg-red-500/90 hover:bg-red-600 text-white shadow-lg hover:shadow-red-500/20 transition-all"
                                  >
                                    ✗ Reject
                                  </Button>
                                </>
                              )}
                              {nomination.status === 'approved' && (
                                <Button 
                                  onClick={() => handleDeclareWinner(nomination._id, nomination.house._id)} 
                                  size="sm" 
                                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-yellow-500/20 transition-all"
                                >
                                  👑 Declare Winner
                                </Button>
                              )}
                              <Button 
                                onClick={() => handleDelete(nomination._id)} 
                                size="sm" 
                                className="bg-gray-600/90 hover:bg-gray-700 text-white shadow-lg transition-all"
                              >
                                🗑️ Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}