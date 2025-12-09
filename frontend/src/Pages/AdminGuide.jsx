import React from "react";
import { Card } from "../Components/ui/Card";
import { Badge } from "../Components/ui/Badge";
import { Shield, Calendar, Vote, Users, Trophy, Image as ImageIcon, Download, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "../Components/ui/Button";

export default function AdminGuidePage() {
  const features = [
    {
      icon: Calendar,
      title: "Event Management",
      description: "Create, edit, and delete events. Upload event covers and payment QR codes.",
      capabilities: [
        "Create unlimited events",
        "Add cover images and payment QRs",
        "Update event status (upcoming/ongoing/completed)",
        "Download participant lists as CSV",
        "Generate AI-powered event reports"
      ],
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Vote,
      title: "Voting & Nominations",
      description: "Approve or reject student nominations for house leadership positions.",
      capabilities: [
        "Review pending nominations",
        "Approve/reject candidates",
        "Monitor voting statistics",
        "View real-time vote counts",
        "Manage leadership positions"
      ],
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Users,
      title: "Registration Management",
      description: "Verify payments and track attendance for all events.",
      capabilities: [
        "Verify payment screenshots",
        "Mark attendance for events",
        "Download participant lists",
        "Filter by event",
        "View registration statistics"
      ],
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Trophy,
      title: "House Management",
      description: "Manage house points and declare event winners.",
      capabilities: [
        "Adjust house points (+/- 10)",
        "Declare event winners",
        "View house statistics",
        "Monitor leaderboard",
        "Manage house information"
      ],
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: ImageIcon,
      title: "Gallery Management",
      description: "Upload and organize campus photos by year and month.",
      capabilities: [
        "Upload event photos",
        "Organize by year/month",
        "Categorize images",
        "Delete photos",
        "Manage gallery collections"
      ],
      gradient: "from-red-500 to-pink-500"
    }
  ];

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Admin Dashboard Guide
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Complete guide to managing the College Hub platform. As an admin, you have full control over events, voting, registrations, and more.
          </p>
          <Badge className="mt-4 bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-lg px-6 py-2">
            👑 Administrator Access
          </Badge>
        </motion.div>

        {/* Important Note */}
        <Card className="glass-card p-6 border-yellow-500/30 mb-12">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Admin Login Instructions</h3>
              <p className="text-gray-300 mb-3">
                <strong className="text-white">Important:</strong> There is no separate admin login page. All users (students and admins) login through the same "Login / Sign Up" button.
              </p>
              <p className="text-gray-300 mb-3">
                Your account is marked as <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Admin</Badge> in the system. After logging in with your credentials, you will automatically see the <strong className="text-white">Admin Dashboard</strong> option in the sidebar.
              </p>
              <p className="text-green-300">
                ✅ Look for the "Admin Dashboard" link in the sidebar navigation to access all admin features.
              </p>
            </div>
          </div>
        </Card>

        {/* Features Grid */}
        <div className="space-y-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card p-8 border-gray-800 hover:border-purple-500/30 transition-all">
                <div className="flex items-start gap-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center flex-shrink-0`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400 mb-4">{feature.description}</p>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-purple-400 mb-3">Key Capabilities:</p>
                      {feature.capabilities.map((capability, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span>{capability}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="glass-card p-8 border-gray-800 mt-12">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Quick Access</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Link to={createPageUrl("AdminDashboard")}>
              <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 py-6 text-lg">
                <Shield className="w-5 h-5 mr-2" />
                Go to Admin Dashboard
              </Button>
            </Link>
            <Link to={createPageUrl("Home")}>
              <Button variant="outline" className="w-full border-gray-700 text-white hover:bg-white/10 py-6 text-lg">
                Back to Home
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}