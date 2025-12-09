import React, { useEffect, useState, useRef } from "react";
import { 
  Trophy, 
  Calendar, 
  Vote, 
  TrendingUp,
  Users,
  Sparkles,
  ArrowRight,
  Award,
  LogIn,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Heart,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  Megaphone
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

// Headline Marquee Component
const HeadlineMarquee = ({ message }) => {
  if (!message) return null;

  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 overflow-hidden flex items-center">
      <Megaphone className="w-6 h-6 mx-4 flex-shrink-0" />
      <div className="overflow-hidden w-full">
        <p className="whitespace-nowrap animate-marquee-rtl">{message}</p>
      </div>
      <style>{`
        @keyframes marquee-rtl {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-marquee-rtl {
          animation: marquee-rtl 20s  infinite;
          display: inline-block;
          padding-right: 100%; // to ensure seamless looping
        }
      `}</style>
    </div>
  );
};

// Image Slider Component
const ImageSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  const sliderImages = [
    {
      url: "/image/img8.jpg",
      title: "Campus Life",
      description: "Experience the vibrant campus culture",
    },
    {
      url: "/image/img2.jpg",
      title: "Academic Excellence",
      description: "Pursue your dreams with us",
    },
    {
      url: "/image/img3.jpg",
      title: "Events & Activities",
      description: "Join exciting campus events",
    },
    {
      url: "/image/img5.jpg",
      title: "Innovation Hub",
      description: "Where ideas come to life",
    },
    {
      url: "/image/img1.jpg",
      title: "Community Spirit",
      description: "Together we achieve more",
    },
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sliderImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, sliderImages.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % sliderImages.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden group rounded-2xl shadow-xl">
      <div className="relative w-full h-full">
        {sliderImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentIndex 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-110'
            }`}
          >
            <img
              src={image.url}
              alt={image.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            <div className={`absolute bottom-0 left-0 right-0 p-8 md:p-12 transition-all duration-700 ${
              index === currentIndex ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
                {image.title}
              </h2>
              <p className="text-lg md:text-xl text-gray-200 drop-shadow-lg">
                {image.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/30 backdrop-blur-md border border-white/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/50 hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/30 backdrop-blur-md border border-white/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/50 hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {sliderImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex 
                ? 'w-10 h-3 bg-white' 
                : 'w-3 h-3 bg-white/60 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

// Typing Effect Component
const TypingText = ({ text, speed = 100, className = "" }) => {
  const [displayText, setDisplayText] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(speed);

  useEffect(() => {
    const handleTyping = () => {
      const fullText = text;
      
      if (isDeleting) {
        setDisplayText(prev => fullText.substring(0, charIndex - 1));
        setCharIndex(prev => prev - 1);
      } else {
        setDisplayText(prev => fullText.substring(0, charIndex + 1));
        setCharIndex(prev => prev + 1);
      }

      if (!isDeleting && charIndex === fullText.length) {
        setTypingSpeed(1500);
        setIsDeleting(true);
      } else if (isDeleting && charIndex === 0) {
        setTypingSpeed(500);
        setIsDeleting(false);
      } else {
        setTypingSpeed(speed);
      }
    };

    const timeout = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, text, typingSpeed, speed]);

  return <span className={className}>{displayText}<span className="animate-pulse">|</span></span>;
};

export default function Home() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [houses, setHouses] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [headline, setHeadline] = useState('');

  useEffect(() => {
    const token = localStorage?.getItem('token');
    if (token) {
        setIsAuthenticated(true);
    }
    
    fetch(`${API_URL}/houses`)
      .then(res => res.json())
      .then(data => setHouses(data))
      .catch(err => console.error(err));
      
    fetch(`${API_URL}/events`)
      .then(res => res.json())
      .then(events => {
        const upcoming = events.filter(e => e.status === 'upcoming').slice(0, 3);
        setUpcomingEvents(upcoming);
      })
      .catch(err => console.error(err));

    fetch(`${API_URL}/notifications/headline`)
      .then(res => res.json())
      .then(data => setHeadline(data.message))
      .catch(err => console.error(err));
  }, []);

  const handleLogin = () => {
    window.location.href = '/login';
  };

  const quickActions = [
    {
      title: "Cast Your Vote",
      description: "Choose your house leaders",
      icon: Vote,
      link: "/voting",
      bgGradient: "from-blue-100 to-cyan-100",
      iconColor: "text-blue-600",
      requiresLogin: true
    },
    {
      title: "Upcoming Events",
      description: "Register for campus events",
      icon: Calendar,
      link: "/events",
      bgGradient: "from-purple-100 to-pink-100",
      iconColor: "text-purple-600",
      requiresLogin: true
    },
    {
      title: "House Rankings",
      description: "View live leaderboard",
      icon: Trophy,
      link: "/leaderboard",
      bgGradient: "from-amber-100 to-orange-100",
      iconColor: "text-amber-600",
      requiresLogin: false
    },
    {
      title: "Photo Gallery",
      description: "Explore campus memories",
      icon: ImageIcon,
      link: "/gallery",
      bgGradient: "from-green-100 to-teal-100",
      iconColor: "text-green-600",
      requiresLogin: false
    }
  ];

  const topHouses = [...houses].sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 3);

  const handleActionClick = (action, e) => {
    if (action.requiresLogin && !isAuthenticated) {
      e.preventDefault();
      alert("⚠️ Please login first to access this feature!");
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <HeadlineMarquee message={headline} />
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 py-20 md:py-32 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto relative z-0">
          <div className="text-center opacity-0" style={{animation: 'fadeInUp 0.8s ease-out forwards'}}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-300 mb-6">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700 font-medium">Welcome to Your College Hub</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              <TypingText text="Unite. Compete. Excel." speed={80} className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600" />
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              <TypingText 
                text="Your central hub for house competitions, campus events, and creating unforgettable memories together" 
                speed={30}
                className="text-gray-600"
              />
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!isAuthenticated ? (
                <>
                  <button 
                    onClick={handleLogin}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-medium shadow-lg shadow-blue-200 transition-all hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-5 h-5" />
                    Login / Sign Up
                  </button>
                  <div onClick={(e) => handleActionClick({ requiresLogin: false, link: "/leaderboard" }, e)} className="cursor-pointer">
                    <button className="border-2 border-gray-400 text-gray-700 hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-medium transition-all flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      View Leaderboard
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <a href="/voting">
                    <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-medium shadow-lg shadow-blue-200 transition-all hover:scale-105 flex items-center justify-center gap-2">
                      <Vote className="w-5 h-5" />
                      Start Voting
                    </button>
                  </a>
                  <a href="/events">
                    <button className="border-2 border-gray-400 text-gray-700 hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-medium transition-all flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Browse Events
                    </button>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Image Slider */}
      <div className="relative z-10 px-4 sm:px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <ImageSlider />
        </div>
      </div>

      {/* Quick Actions Section */}
      <section className="px-4 sm:px-6 py-16 relative">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <div key={action.title} className="opacity-0" style={{animation: `fadeInUp 0.5s ease-out ${index * 0.1 + 0.5}s forwards`}}>
                {action.requiresLogin && !isAuthenticated ? (
                  <div onClick={(e) => handleActionClick(action, e)} className="cursor-pointer h-full">
                    <div className="bg-white p-6 rounded-xl hover:scale-105 transition-all duration-300 border border-gray-200 group relative h-full flex flex-col shadow-sm hover:shadow-lg">
                      <div className="absolute top-3 right-3">
                        <LogIn className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${action.bgGradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                        {React.createElement(action.icon, { className: `w-7 h-7 ${action.iconColor}` })}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{action.title}</h3>
                      <p className="text-gray-600 mb-4 flex-grow text-sm">{action.description}</p>
                      <div className="flex items-center text-blue-600 group-hover:text-blue-700 mt-auto">
                        <span className="text-sm font-medium">Login Required</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <a href={action.link} className="h-full block">
                    <div className="bg-white p-6 rounded-xl hover:scale-105 transition-all duration-300 cursor-pointer group border border-gray-200 h-full flex flex-col shadow-sm hover:shadow-lg">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${action.bgGradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                        {React.createElement(action.icon, { className: `w-7 h-7 ${action.iconColor}` })}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{action.title}</h3>
                      <p className="text-gray-600 mb-4 flex-grow text-sm">{action.description}</p>
                      <div className="flex items-center text-blue-600 group-hover:text-blue-700 mt-auto">
                        <span className="text-sm font-medium">Explore</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Houses Section */}
      <section className="px-4 sm:px-6 py-16 relative bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Top Houses
              </h2>
              <p className="text-gray-600">Current leaderboard standings</p>
            </div>
            <div onClick={(e) => handleActionClick({ requiresLogin: false, link: "/leaderboard" }, e)} className="cursor-pointer">
              <button className="border-2 border-gray-400 text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg transition-all flex items-center gap-2">
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topHouses.map((house, index) => (
              <div key={house._id} className="opacity-0" style={{animation: `fadeInUp 0.5s ease-out ${index * 0.15 + 1}s forwards`}}>
                <div className="bg-white p-6 rounded-xl relative overflow-hidden border border-gray-200 hover:border-gray-300 transition-all shadow-sm hover:shadow-lg">
                  {index === 0 && (
                    <div className="absolute top-4 right-4">
                      <Award className="w-8 h-8 text-amber-500" />
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 mb-4">
                    {house.logo_url ? (
                      <img src={house.logo_url} alt={house.name} className="w-16 h-16 rounded-full object-cover shadow-md" />
                    ) : (
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                        style={{ backgroundColor: house.color || '#6366f1' }}
                      >
                        {house.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{house.name}</h3>
                      <p className="text-gray-600 text-sm">{house.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <span className="text-gray-600">Total Points</span>
                    <span className="text-2xl font-bold text-blue-600">{house.points || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="px-4 sm:px-6 py-16 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Upcoming Events
              </h2>
              <p className="text-gray-600">Don't miss out on these exciting activities</p>
            </div>
            <div onClick={(e) => handleActionClick({ requiresLogin: false, link: "/events" }, e)} className="cursor-pointer">
              <button className="border-2 border-gray-400 text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg transition-all flex items-center gap-2">
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event, index) => (
              <div key={event._id} className="opacity-0" style={{animation: `fadeInUp 0.5s ease-out ${index * 0.1 + 1.5}s forwards`}}>
                <div className="bg-white overflow-hidden rounded-xl hover:scale-105 transition-all duration-300 border border-gray-200 h-full flex flex-col shadow-sm hover:shadow-lg">
                  {event.cover_image_url && (
                    <div className="h-48 overflow-hidden bg-gray-200">
                      <img 
                        src={event.cover_image_url} 
                        alt={event.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 bg-blue-100 text-blue-700 border border-blue-300 self-start">
                      {event.category}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{event.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">{event.description}</p>
                    <div className="flex items-center justify-between text-sm mt-auto">
                      <span className="text-gray-600">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-blue-600 font-medium">{event.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 sm:px-6 py-16 relative bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl text-center border border-gray-200 hover:scale-105 transition-all shadow-sm hover:shadow-lg">
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-4xl font-bold text-gray-900 mb-2">{houses.length}</h3>
              <p className="text-gray-600">Active Houses</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl text-center border border-gray-200 hover:scale-105 transition-all shadow-sm hover:shadow-lg">
              <Calendar className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-4xl font-bold text-gray-900 mb-2">{upcomingEvents.length}+</h3>
              <p className="text-gray-600">Upcoming Events</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl text-center border border-gray-200 hover:scale-105 transition-all shadow-sm hover:shadow-lg">
              <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-4xl font-bold text-gray-900 mb-2">24/7</h3>
              <p className="text-gray-600">Platform Access</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative mt-20 border-t border-black-200 bg-black-50">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 py-12 bg-black">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div className="sm:col-span-2 lg:col-span-1 text-center sm:text-left">
              <h3 className="text-2xl font-bold text-white mb-4">eventix</h3>
              <p className="text-white text-sm mb-4">
                Your ultimate platform for house competitions, events, and campus life management.
              </p>
              <div className="flex gap-3 justify-center sm:justify-start">
                <a href="#" className="w-10 h-10 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-400 hover:scale-110 transition-all">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-600 hover:text-blue-400 hover:border-blue-400 hover:scale-110 transition-all">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-600 hover:text-pink-600 hover:border-pink-400 hover:scale-110 transition-all">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-600 hover:text-blue-500 hover:border-blue-500 hover:scale-110 transition-all">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div className="text-center sm:text-left">
              <h4 className="text-gray-900  text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <div onClick={(e) => handleActionClick({ requiresLogin: false, link: "/leaderboard" }, e)} className="cursor-pointer text-white hover:text-blue-600 transition-colors text-sm">
                    Leaderboard
                  </div>
                </li>
                <li>
                  <div onClick={(e) => handleActionClick({ requiresLogin: false, link: "/events" }, e)} className="cursor-pointer text-white hover:text-blue-600 transition-colors text-sm">
                    Events
                  </div>
                </li>
                <li>
                  <div onClick={(e) => handleActionClick({ requiresLogin: false, link: "/gallery" }, e)} className="cursor-pointer text-white hover:text-blue-600 transition-colors text-sm">
                    Gallery
                  </div>
                </li>
                <li>
                  <div onClick={(e) => handleActionClick({ requiresLogin: false, link: "/voting" }, e)} className="cursor-pointer text-white hover:text-blue-600 transition-colors text-sm">
                    Voting
                  </div>
                </li>
              </ul>
            </div>

            <div className="text-center sm:text-left">
              <h4 className="text-gray-900  text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-white hover:text-blue-600 transition-colors text-sm">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white hover:text-blue-600 transition-colors text-sm">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white hover:text-blue-600 transition-colors text-sm">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white hover:text-blue-600 transition-colors text-sm">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>

            <div className="text-center sm:text-left">
              <h4 className="text-white  font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-3 flex flex-col items-center sm:items-start">
                <li className="flex items-start gap-2 text-white text-sm">
                  <MapPin className="w-4 h-4 mt-1  text-white flex-shrink-0" />
                  <span>PIMR, BHOPAL</span>
                </li>
                <li className="flex items-center gap-2 text-white text-sm">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>+91</span>
                </li>
                <li className="flex items-center gap-2 text-white text-sm">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span>info@college.edu</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white text-sm text-center md:text-left">
            
            </p>
            <p className="text-white text-sm flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> for our campus community
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}