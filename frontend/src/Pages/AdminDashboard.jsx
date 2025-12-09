import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../Components/ui/Tabs";
import { Shield, Calendar, Vote, Image as ImageIcon, Trophy, Users, FileText, Bell } from "lucide-react";
import AdminEvents from "../Components/admin/AdminEvents";
import AdminNominations from "../Components/admin/AdminNominations";
import AdminRegistrations from "../Components/admin/AdminRegistrations";
import AdminHouses from "../Components/admin/AdminHouses";
import AdminGallery from "../Components/admin/AdminGallery";
import ReportGeneration from "./ReportGeneration";
import AdminNotificationSender from "./SendNotification";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("events");

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-4">
            <Shield className="w-8 h-8 sm:w-10 sm:h-10 inline mr-3 text-yellow-400" />
            Admin Dashboard
          </h1>
          <p className="text-lg sm:text-xl text-gray-400">Manage all platform activities and content</p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-gray-800/50 mb-6 flex flex-wrap items-center justify-start h-auto p-2 gap-2">
            <TabsTrigger value="events" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-gray-900">
              <Calendar className="w-4 h-4 mr-2" />
              Events
            </TabsTrigger>
            <TabsTrigger value="nominations" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-gray-900">
              <Vote className="w-4 h-4 mr-2" />
              Nominations
            </TabsTrigger>
            <TabsTrigger value="registrations" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-gray-900">
              <Users className="w-4 h-4 mr-2" />
              Registrations
            </TabsTrigger>
            <TabsTrigger value="houses" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-gray-900">
              <Trophy className="w-4 h-4 mr-2" />
              Houses
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-gray-900">
              <ImageIcon className="w-4 h-4 mr-2" />
              Gallery
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-gray-900">
              <FileText className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="notify" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-gray-900">
              <Bell className="w-4 h-4 mr-2" />
              Notify
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <AdminEvents />
          </TabsContent>

          <TabsContent value="nominations">
            <AdminNominations />
          </TabsContent>

          <TabsContent value="registrations">
            <AdminRegistrations />
          </TabsContent>

          <TabsContent value="houses">
            <AdminHouses />
          </TabsContent>

          <TabsContent value="gallery">
            <AdminGallery />
          </TabsContent>

          <TabsContent value="reports">
            <ReportGeneration />
          </TabsContent>
          
          <TabsContent value="notify">
            <AdminNotificationSender />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}