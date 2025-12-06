import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "./lib/utils";
import { Button } from "./Components/ui/Button";
import { Badge } from "./Components/ui/Badge";
import { Input } from "./Components/ui/Input";
import { Label } from "./Components/ui/Label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./Components/ui/Dialog";
import { 
  Home, 
  Vote, 
  Calendar, 
  Trophy, 
  Image as ImageIcon, 
  Bell, 
  User, 
  Shield,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Lock,
  LogIn
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, API_URL } from "./context/AuthContext";
import { useSocket } from "./context/SocketContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';




export default function Layout({ children }) {
  const { user, isAuthenticated, login, logout, adminLogin, loading } = useAuth(); // Get user and auth state from AuthContext
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ email: '', password: '' });
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPageName = location.pathname.split('/').pop() || 'Home';
  const socket = useSocket();
  console.log('Socket object in Layout:', socket);
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('Layout component mounted');
    if (socket) {
      console.log('Socket connected');
      socket.on('newNotification', () => {
        console.log('newNotification event received');
        toast.info('You have a new notification!');
        queryClient.invalidateQueries(['notifications']);
        queryClient.invalidateQueries(['unread-notifications']);
      });

      socket.on('winnerDeclared', () => {
        console.log('winnerDeclared event received');
        toast.success('Election results have been declared!');
        queryClient.invalidateQueries(['notifications']);
        queryClient.invalidateQueries(['unread-notifications']);
      });

      return () => {
        console.log('Cleaning up socket listeners');
        socket.off('newNotification');
        socket.off('winnerDeclared');
      };
    }
  }, [socket, queryClient]);

  // Removed hardcoded ADMIN_EMAIL and ADMIN_PASSWORD

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id || !isAuthenticated || !token) return 0;

      const res = await fetch(`${API_URL}/api/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error('Failed to fetch unread notifications count');
      }
      const data = await res.json();
      return data.count;
    },
    enabled: !!user?.id && isAuthenticated && !!token,
    refetchInterval: 30000,
    initialData: 0,
  });



  useEffect(() => {
    // Admin authentication based on user role from AuthContext.
    // No need to check localstorage for token or decode here anymore
    // The main user authentication is handled by AuthProvider and useAuth()

    if (user?.role === 'admin') {
      setAdminAuthenticated(true);
    } else {
      setAdminAuthenticated(false);
    }

    // Handle route protection for admin dashboard
    if (location.pathname === "/admin" && (!isAuthenticated || (isAuthenticated && user?.role !== 'admin'))) {
      navigate(createPageUrl("Home")); // Redirect non-admins away from admin dashboard
    }

  }, [isAuthenticated, user, navigate, currentPageName]);

  const handleLogout = () => {
    // Use logout from AuthContext to clear the token and user state
    logout();
    setAdminAuthenticated(false);
    sessionStorage.removeItem('adminAuthenticated'); // Clear admin session storage too
    navigate(createPageUrl("Home"));
    window.location.reload();
  };

  const handleAdminLogout = () => {
    // Admin logout should just revert adminAuthenticated state, not necessarily full logout
    // if regular user is still logged in.
    // However, if adminAuthenticated means full admin session, then it calls full logout.
    // For simplicity, let's assume admin logout is full logout if you're admin.
    logout(); 
    setAdminAuthenticated(false);
    sessionStorage.removeItem('adminAuthenticated');
    navigate(createPageUrl("Home"));
    window.location.reload();
  };

  const handleLoginRedirect = () => {
    // This should redirect to your login page, or open a login modal
    navigate('/register');
    setSidebarOpen(false);
  };

  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const loginData = await adminLogin(adminCredentials.email, adminCredentials.password); // Use adminLogin from AuthContext
      setShowAdminLogin(false);
      if (loginData.user.role === 'admin') {
        navigate(createPageUrl("AdminDashboard"));
      }
      toast.success("✅ Admin access granted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Invalid admin credentials!");
      setAdminCredentials({ email: '', password: '' });
    }
  };

  const handleAdminClick = () => {
    if (!isAuthenticated) {
      toast.warn("⚠️ Please login first!");
      handleLoginRedirect();
      return;
    }

    if (adminAuthenticated) {
      navigate(createPageUrl("AdminDashboard"));
    } else {
      setShowAdminLogin(true);
    }
  };

  const navItems = [
    { name: "Home", icon: Home, path: "Home", gradient: "from-blue-500 to-cyan-500", public: true },
    { name: "Voting", icon: Vote, path: "Voting", gradient: "from-purple-500 to-pink-500" },
    { name: "Events", icon: Calendar, path: "Events", gradient: "from-green-500 to-teal-500" },
    { name: "Event Calendar", icon: Calendar, path: "EventCalendar", gradient: "from-blue-500 to-purple-500" },
    { name: "Leaderboard", icon: Trophy, path: "Leaderboard", gradient: "from-yellow-500 to-orange-500" },
    // { name: "Voting Results", icon: Trophy, path: "VotingResults", gradient: "from-yellow-500 to-orange-500" },
    { name: "Gallery", icon: ImageIcon, path: "Gallery", gradient: "from-red-500 to-pink-500" },
  ];

  const visibleNavItems = isAuthenticated ? navItems : navItems.filter(item => item.public);


  const userHouse = user?.house;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a1e] via-[#0f0f1e] to-[#1a1a2e]">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 flex items-center justify-center animate-spin">
          <Shield className="w-8 h-8 text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1e] via-[#0f0f1e] to-[#1a1a2e]">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-16 glass-card border-b border-gray-800/50 backdrop-blur-xl">
        <div className="h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white hover:bg-white/10"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>

            <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 flex items-center justify-center group-hover:scale-110 transition-transform pulse-glow">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white hidden sm:block">Eventix</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                {/* Show Admin Badge OR House Badge */}
                {adminAuthenticated ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card border border-yellow-500/50 bg-yellow-500/10">
                    <Shield className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs sm:text-sm font-bold text-yellow-300 hidden sm:block">
                      ADMIN
                    </span>
                  </div>
                ) : userHouse ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card border border-gray-700">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: userHouse.color }}
                    />
                    <span className="text-xs sm:text-sm font-medium text-white hidden sm:block">{userHouse.name}</span>
                  </div>
                ) : null}

                {!adminAuthenticated && (
                  <>
                    <Link to={createPageUrl("Notifications")}>
                      <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10">
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                          <Badge className="absolute -top-1 -right-1 bg-red-500 text-white px-1.5 py-0 text-xs min-w-[20px] h-5 animate-pulse">
                            {unreadCount}
                          </Badge>
                        )}
                      </Button>
                    </Link>

                    <Link to={createPageUrl("Profile")}>
                      <Button variant="ghost" className="text-white hover:bg-white/10 px-2 sm:px-4">
                        <User className="w-5 h-5 sm:mr-2" />
                        <span className="hidden sm:inline">{user?.full_name.split(' ')[0]}</span>
                      </Button>
                    </Link>
                  </>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={adminAuthenticated ? handleAdminLogout : handleLogout}
                  className="text-white hover:bg-red-500/20"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <Button
                onClick={handleLoginRedirect}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-4 sm:px-6 text-sm sm:text-base"
              >
                Login / Sign Up
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed left-0 top-16 bottom-0 w-full max-w-xs sm:w-72 glass-card border-r border-gray-800/50 backdrop-blur-xl z-40 overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              {/* Only show user info if LOGGED IN */}
              {isAuthenticated && user ? (
                <div className="glass-card p-4 rounded-xl border border-gray-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold truncate">{user.full_name}</p>
                      <p className="text-gray-400 text-xs truncate">{user.email}</p>
                    </div>
                  </div>

                  {adminAuthenticated ? (
                    <Badge className="mt-2 bg-yellow-500/20 text-yellow-300 border-yellow-500/30 w-full justify-center">
                      👑 Admin Access
                    </Badge>
                  ) : userHouse ? (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: `${userHouse.color}20` }}>
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: userHouse.color }}
                      />
                      <span className="text-sm font-medium text-white">{userHouse.name} House</span>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="glass-card p-6 rounded-xl border border-purple-500/30 text-center">
                  <User className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                  <p className="text-white font-bold mb-2">Welcome!</p>
                  <p className="text-gray-400 text-sm mb-4">Login to access all features</p>
                  <Button 
                    onClick={() => { handleLoginRedirect(); setSidebarOpen(false); }}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Login / Sign Up
                  </Button>
                </div>
              )}

              {/* Navigation */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3">Navigation</p>
                {visibleNavItems.map((item) => {
                  const isActive = currentPageName === item.path;
                  return (
                    <Link key={item.path} to={createPageUrl(item.path)} onClick={() => setSidebarOpen(false)}>
                      <motion.div
                        whileHover={{ x: 4 }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          isActive
                            ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium flex-1">{item.name}</span>
                        {isActive && <ChevronRight className="w-4 h-4" />}
                      </motion.div>
                    </Link>
                  );
                })}

                {/* ADMIN SECTION */}
                {isAuthenticated && (
                  <>
                    <div className="h-px bg-gray-800 my-4" />
                    <p className="text-xs font-bold text-yellow-400 uppercase tracking-wider px-3">🔒 Admin Panel</p>
                    
                    {adminAuthenticated ? (
                      <Link to={createPageUrl("AdminDashboard")} onClick={() => setSidebarOpen(false)}>
                        <motion.div
                          whileHover={{ x: 4 }}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                            currentPageName === 'AdminDashboard'
                              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Shield className="w-5 h-5" />
                          <span className="font-medium flex-1">
                            Admin Dashboard
                          </span>
                          {(currentPageName === 'AdminDashboard') && <ChevronRight className="w-4 h-4" />}
                        </motion.div>
                      </Link>
                    ) : (
                      <motion.div
                        whileHover={{ x: 4 }}
                        onClick={() => { handleAdminClick(); setSidebarOpen(false); }}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer text-gray-400 hover:text-white hover:bg-yellow-500/10 border border-yellow-500/30"
                      >
                        <Shield className="w-5 h-5 text-yellow-400" />
                        <span className="font-medium flex-1">Admin Login</span>
                        <Lock className="w-4 h-4 text-yellow-400" />
                      </motion.div>
                    )}
                  </>
                )}
              </div>

              {/* House Info - Only show if NOT admin AND logged in */}
              {/* {!adminAuthenticated && userHouse && isAuthenticated && (
                <div className="glass-card p-4 rounded-xl border border-gray-700">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Your House</p>
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold text-white"
                      style={{ backgroundColor: userHouse.color }}
                    >
                      {userHouse.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-bold">{userHouse.name}</p>
                      <p className="text-gray-400 text-xs">{userHouse.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                    <span className="text-gray-400 text-sm">Points</span>
                    <span className="text-2xl font-bold text-white">{userHouse.points || 0}</span>
                  </div>
                </div>
              )} */}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Admin Login Dialog */}
      <Dialog open={showAdminLogin} onOpenChange={setShowAdminLogin}>
        <DialogContent className="bg-gradient-to-br from-[#0a0a1e] to-[#1a1a3e] border-yellow-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <Shield className="w-6 h-6 text-yellow-400" />
              Admin Login
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAdminLoginSubmit} className="space-y-4 mt-4">
            <div>
              <Label className="text-gray-300">Admin Email</Label>
              <Input
                type="email"
                value={adminCredentials.email}
                onChange={(e) => setAdminCredentials({...adminCredentials, email: e.target.value})}
                required
                placeholder="admin@gmail.com"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>

            <div>
              <Label className="text-gray-300">Admin Password</Label>
              <Input
                type="password"
                value={adminCredentials.password}
                onChange={(e) => setAdminCredentials({...adminCredentials, password: e.target.value})}
                required
                placeholder="••••••••"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-6 text-lg"
            >
              <Lock className="w-5 h-5 mr-2" />
              Login as Admin
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 top-16"
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-16 min-h-screen">
        {children}
      </main>

      <style>{`
        .glass-card {
          background: rgba(15, 15, 30, 0.7);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
          }
          50% {
            box-shadow: 0 0 40px rgba(168, 85, 247, 0.8);
          }
        }

        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(15, 15, 30, 0.5);
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #8b5cf6 0%, #ec4899 100%);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #7c3aed 0%, #db2777 100%);
        }
      `}</style>
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="dark" />
    </div>
  );
}