
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "../Components/ui/Card";
import { Button } from "../Components/ui/Button";
import { Badge } from "../Components/ui/Badge";
import { Tabs, TabsList, TabsTrigger } from "../Components/ui/Tabs";
import { Bell, Calendar, Vote, Trophy, CheckCircle, Trash2, BellOff, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

const API_URL = "http://localhost:5000/api";

export default function NotificationsPage() {
  const { user, isAuthenticated, token } = useAuth();
  const [filter, setFilter] = useState("all");
  const queryClient = useQueryClient();
  const socket = useSocket();

  console.log('[NotificationsPage] Rendering. User:', user, 'Authenticated:', isAuthenticated, 'Socket:', socket ? 'connected' : 'disconnected');

  useEffect(() => {
    console.log('[NotificationsPage] useEffect running. Socket:', socket, 'User ID:', user?.id);
    if (socket && user?.id) {
      console.log(`[NotificationsPage] Joining socket room: ${user.id}`);
      socket.emit('join', user.id);

      const handleNewNotification = (newNotification) => {
        console.log('[NotificationsPage]  SOCKET EVENT: "newNotification" received:', newNotification);
        queryClient.setQueryData(['notifications', user.id], (oldData) => {
          console.log('[NotificationsPage] Updating query cache with new notification.');
          return [newNotification, ...(oldData || [])];
        });
        queryClient.invalidateQueries(['unread-notifications']);
      };

      socket.on('newNotification', handleNewNotification);

      return () => {
        console.log(`[NotificationsPage] Leaving socket room: ${user.id}`);
        socket.off('newNotification', handleNewNotification);
      };
    }
  }, [socket, user?.id, queryClient]);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      console.log('[NotificationsPage] Query starting for user:', user?.id);
      if (!user?.id || !isAuthenticated || !token) {
        console.log('[NotificationsPage] Query skipped: user or token not available.');
        return [];
      }

      const res = await fetch(`${API_URL}/notifications`, {
          headers: {
              'Authorization': `Bearer ${token}`
          }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      return await res.json();
    },
    enabled: !!user?.id && isAuthenticated && !!token,
    onSuccess: (data) => {
        console.log('[NotificationsPage] Query SUCCESS. Fetched notifications:', data);
    },
    onError: (error) => {
        console.error('[NotificationsPage] Query ERROR:', error);
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id) => {
        return await fetch(`${API_URL}/notifications/${id}/read`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (id) => {
        return await fetch(`${API_URL}/notifications/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
        return await fetch(`${API_URL}/notifications/read-all`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
    },
  });

  const getIcon = (type) => {
    switch (type) {
      case 'event': return <Calendar className="w-5 h-5 text-blue-400" />;
      case 'voting': return <Vote className="w-5 h-5 text-purple-400" />;
      case 'leaderboard': return <Trophy className="w-5 h-5 text-yellow-400" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const getGradient = (type) => {
    switch (type) {
      case 'event': return 'from-blue-500 to-cyan-500';
      case 'voting': return 'from-purple-500 to-pink-500';
      case 'leaderboard': return 'from-yellow-500 to-orange-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
                <div className="relative">
                  <Bell className="w-12 h-12 text-purple-400" />
                  {unreadCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold"
                    >
                      {unreadCount}
                    </motion.div>
                  )}
                </div>
                Notifications
              </h1>
              <p className="text-xl text-gray-400">Stay updated with all activities</p>
            </div>
            
            {unreadCount > 0 && (
              <Button
                onClick={() => markAllAsReadMutation.mutate()}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark all as read
              </Button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="glass-card p-4 border-gray-800 text-center">
              <div className="text-3xl font-bold text-white">{notifications.length}</div>
              <div className="text-sm text-gray-400">Total</div>
            </Card>
            <Card className="glass-card p-4 border-gray-800 text-center">
              <div className="text-3xl font-bold text-red-400">{unreadCount}</div>
              <div className="text-sm text-gray-400">Unread</div>
            </Card>
            <Card className="glass-card p-4 border-gray-800 text-center">
              <div className="text-3xl font-bold text-blue-400">
                {notifications.filter(n => n.type === 'event').length}
              </div>
              <div className="text-sm text-gray-400">Events</div>
            </Card>
            <Card className="glass-card p-4 border-gray-800 text-center">
              <div className="text-3xl font-bold text-purple-400">
                {notifications.filter(n => n.type === 'voting').length}
              </div>
              <div className="text-sm text-gray-400">Voting</div>
            </Card>
          </div>
        </motion.div>

        {/* Filters */}
        <Tabs value={filter} onValueChange={setFilter} className="mb-6">
          <TabsList className="bg-gray-800/50 w-full justify-start overflow-x-auto">
            <TabsTrigger value="all" className="data-[state=active]:bg-purple-500">
              <Filter className="w-4 h-4 mr-2" />
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread" className="data-[state=active]:bg-red-500">
              <Bell className="w-4 h-4 mr-2" />
              Unread ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="event" className="data-[state=active]:bg-blue-500">
              <Calendar className="w-4 h-4 mr-2" />
              Events
            </TabsTrigger>
            <TabsTrigger value="voting" className="data-[state=active]:bg-purple-500">
              <Vote className="w-4 h-4 mr-2" />
              Voting
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-yellow-500">
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          <AnimatePresence>
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card 
                  className={`glass-card p-5 border-gray-800 hover:bg-gray-800/50 transition-all relative overflow-hidden ${
                    !notification.read ? 'border-l-4 border-l-purple-500' : ''
                  }`}
                >
                  {/* Gradient background for unread */}
                  {!notification.read && (
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getGradient(notification.type)}`} />
                  )}

                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${getGradient(notification.type)} bg-opacity-20`}>
                      {getIcon(notification.type)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                            {notification.title}
                            {!notification.read && (
                              <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                                NEW
                              </Badge>
                            )}
                          </h3>
                          <p className="text-gray-300">{notification.message}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-4">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(notification.created_date), "PPp")}
                        </span>

                        <div className="flex gap-2 ml-auto">
                          {!notification.read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsReadMutation.mutate(notification._id)}
                              className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Mark read
                            </Button>
                          )}

                          {notification.link && (
                            <Link to={createPageUrl(notification.link)}>
                              <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                                View Details
                              </Button>
                            </Link>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNotificationMutation.mutate(notification._id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredNotifications.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <BellOff className="w-24 h-24 text-gray-600 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-gray-400 mb-3">No Notifications</h3>
            <p className="text-gray-500 text-lg">You're all caught up! 🎉</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
