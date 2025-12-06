import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Home from './Pages/Home';
import Events from './Pages/Events';
import Gallery from './Pages/Gallery';
import Leaderboard from './Pages/Leaderboard';
import Notifications from './Pages/Notifications';
import Profile from './Pages/Profile';
import ProfileSetup from './Pages/ProfileSetup';
import Voting from './Pages/Voting';
import AdminDashboard from './Pages/AdminDashboard';


import AdminGuide from './Pages/AdminGuide';
import EventCalender from './Pages/EventCalender';
import EventDetails from './Pages/EventDetails';
import EventRegistration from './Components/events/EventRegistration';
import VotingResults from './Pages/VotingResults';
import TicketDetails from './Pages/TicketDetails';
import ReportGeneration from './Pages/ReportGeneration';
import AdminNotificationSender from './Pages/SendNotification';

import { SocketProvider } from './context/SocketContext';
import { AuthProvider } from './context/AuthContext';
import Login from './Pages/Login';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Register from './Pages/Register';

import ProtectedRoute from './Components/ProtectedRoute';
import DownloadTicket from './Pages/DownloadTicket';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Layout>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
            />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/events" element={<Events />} />
                <Route path="/events/:eventId" element={<EventDetails />} />
                <Route path="/events/:eventId/register" element={<EventRegistration />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                {/* <Route path="/notifications" element={<Notifications />} /> */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile-setup" element={<ProfileSetup />} />
                <Route path="/voting" element={<Voting />} />
                <Route path="/voting-results" element={<VotingResults />} />


                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/report-generation" element={<ReportGeneration />} />
                <Route path="/admin/send-notification" element={<AdminNotificationSender />} />
                <Route path="/admin-guide" element={<AdminGuide />} />
                <Route path="/event-calendar" element={<EventCalender />} />
                <Route path="/my-tickets/:registrationId" element={<TicketDetails />} />
                <Route path="/download-ticket" element={<DownloadTicket />} />
              </Route>
            </Routes>
          </Layout>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;