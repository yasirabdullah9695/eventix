import React from 'react';
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { User, Briefcase, Mail, Phone, GraduationCap, Home, CheckCircle, XCircle, Eye, Star, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from '../../context/AuthContext';

export default function NominationCard({
  nomination,
  position,
  onVote,
  hasVoted,
  canVote,
  voteCount,
  index,
  simpleView = false,
  userHouseColor,
  isWinner = false,
  isAdmin = false,
  onDeclareWinner
}) {
  const { BASE_URL } = useAuth();

  const handleVoteClick = () => {
    if (canVote && !hasVoted) {
      onVote(nomination);
    }
  };

  const avatarBorderColor = nomination.user_id.house?.color || userHouseColor || 'border-blue-300';

  if (simpleView) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="h-full"
      >
        <Card className={`bg-white border rounded-lg p-3 flex flex-col items-center h-full hover:shadow-md transition-all duration-200 relative ${
          isWinner ? 'border border-emerald-300 shadow-sm' : 'border-gray-100'
        }`}>
          {isWinner && (
            <div className="absolute -top-2 bg-emerald-500 text-white px-3 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 shadow-sm">
              <Trophy className="w-3 h-3" /> WINNER
            </div>
          )}
          
          {/* Avatar */}
          {nomination.photo ? (
            <img 
              src={`${BASE_URL}${nomination.photo}`} 
              alt={nomination.user_id.full_name} 
              className={`w-20 h-20 rounded-full object-cover border-2 ${avatarBorderColor}`} 
            />
          ) : (
            <div className={`w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-2xl font-semibold border-2 ${avatarBorderColor}`}>
              {nomination.user_id.full_name.charAt(0)}
            </div>
          )}
          
          {/* Name */}
          <h3 className="text-base font-semibold text-gray-900 mt-3 text-center">
            {nomination.user_id.full_name}
          </h3>
          
          {/* Vote Count */}
          <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full mt-2 border border-amber-100">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="text-base font-semibold text-amber-600">{voteCount}</span>
          </div>
          
          {/* Vote Button */}
          {!isWinner && (
            <Button
              onClick={handleVoteClick}
              disabled={hasVoted || !canVote}
              className={`w-full font-medium py-2 text-sm mt-3 rounded-md transition-all ${
                hasVoted 
                  ? 'bg-green-50 text-green-700 cursor-not-allowed border border-green-100' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {hasVoted ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1.5" /> Voted
                </>
              ) : (
                <>
                  <User className="w-4 h-4 mr-1.5" /> Vote
                </>
              )}
            </Button>
          )}
          
          {/* Admin - Declare Winner Button */}
          {isAdmin && !isWinner && (
            <Button
              onClick={onDeclareWinner}
              className="w-full font-medium py-2 text-sm mt-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md"
            >
              Declare Winner
            </Button>
          )}
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="h-full"
    >
      <Card className={`bg-white border rounded-lg p-4 flex flex-col h-full hover:shadow-md transition-all duration-200 relative ${
        isWinner ? 'border border-emerald-300 shadow-sm' : 'border-gray-100'
      }`}>
        {isWinner && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm">
            <Trophy className="w-4 h-4" /> WINNER
          </div>
        )}
        
        {/* Header with Avatar and Info */}
        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
          {/* Avatar */}
          {nomination.photo ? (
            <img 
              src={`${BASE_URL}${nomination.photo}`} 
              alt={nomination.user_id.full_name} 
              className={`w-14 h-14 rounded-full object-cover border-2 ${avatarBorderColor}`} 
            />
          ) : (
            <div className={`w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xl font-semibold border-2 ${avatarBorderColor}`}>
              {nomination.user_id.full_name.charAt(0)}
            </div>
          )}
          
          {/* Name and Details */}
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900">
              {nomination.user_id.full_name}
            </h3>
            <p className="text-xs text-gray-600">
              {nomination.user_id.branch} • {nomination.user_id.year}
            </p>
          </div>
          
          {/* Vote Count Badge */}
          <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-100">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="text-base font-semibold text-amber-600">{voteCount}</span>
          </div>
        </div>

        {/* Information Grid */}
        <div className="space-y-2 text-gray-700 mb-3 flex-1">
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-md">
            <Briefcase className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-medium">{position.title}</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-md">
            <Home className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs font-medium">{nomination.house?.name}</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-md">
            <Mail className="w-3.5 h-3.5 text-orange-600" />
            <span className="text-xs">{nomination.user_id.email}</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-md">
            <Phone className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-xs">{nomination.user_id.phone}</span>
          </div>
        </div>

        {/* Manifesto */}
        <div className="mb-3 flex-1">
          <p className="text-gray-900 font-semibold mb-1.5 text-xs">Manifesto:</p>
          <div className="bg-blue-50 border border-blue-50 p-2.5 rounded-md">
            <p className="text-gray-700 text-xs italic line-clamp-4">
              {nomination.manifesto}
            </p>
          </div>
        </div>

        {/* Achievements */}
        {nomination.achievements && nomination.achievements.length > 0 && (
          <div className="mb-3 flex-1">
            <p className="text-gray-900 font-semibold mb-1.5 text-xs">Achievements:</p>
            <ul className="space-y-1.5">
              {nomination.achievements.map((achievement, i) => (
                <li key={i} className="flex items-start gap-1.5 text-gray-700 text-xs bg-green-50 p-2 rounded-md border border-green-50">
                  <Star className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{achievement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Vote Button */}
        {!isWinner && (
          <Button
            onClick={handleVoteClick}
            disabled={hasVoted || !canVote}
            className={`w-full font-medium py-2.5 text-sm rounded-md transition-all ${
              hasVoted 
                ? 'bg-green-50 text-green-700 cursor-not-allowed border border-green-100' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {hasVoted ? (
              <>
                <CheckCircle className="w-4 h-4 mr-1.5" /> Voted
              </>
            ) : (
              <>
                <User className="w-4 h-4 mr-1.5" /> Vote for {nomination.user_id.full_name.split(' ')[0]}
              </>
            )}
          </Button>
        )}
        
        {/* Admin - Declare Winner Button */}
        {isAdmin && !isWinner && (
          <Button
            onClick={onDeclareWinner}
            className="w-full font-medium py-2.5 text-sm mt-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md"
          >
            Declare Winner
          </Button>
        )}
      </Card>
    </motion.div>
  );
}