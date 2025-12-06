const Vote = require('../models/voteModel');
const Nomination = require('../models/nominationModel');
const User = require('../models/userModel');
const LeaderPosition = require('../models/leaderPositionModel');
const mongoose = require('mongoose');
const House = require('../models/houseModel');

// @desc    Get all votes
// @route   GET /api/votes
// @access  Private/Admin
const getVotes = async (req, res) => {
    try {
        let filter = {};
        if (req.user) {
            console.log('getVotes: req.user exists. Role:', req.user.role, 'House ID:', req.user.house_id);
            if (req.user.role === 'house_admin') {  
                if (!mongoose.Types.ObjectId.isValid(req.user.house_id)) {
                    console.error('getVotes: Invalid house_id for house_admin:', req.user.house_id);
                    return res.status(400).json({ message: 'Invalid house ID provided for house admin.' });
                }
                filter = { house_id: req.user.house_id };
            }
        }
        console.log('getVotes: Constructed filter:', filter);
        const votes = await Vote.find(filter).populate('nomination_id').populate('user_id');
        res.json(votes);
    } catch (error) {
        console.error('Error in getVotes:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Create a vote
// @route   POST /api/votes
// @access  Private
const createVote = async (req, res) => {
    try {
        const { nomination_id, position_id } = req.body;
        const user_id = req.user.id;

        console.log('createVote: Incoming request - nomination_id:', nomination_id, 'position_id:', position_id, 'user_id:', user_id);

        // 1. Get voter's info
        const voter = await User.findById(user_id).populate('house_id');
        if (!voter) {
            console.error('createVote: Voter not found for user_id:', user_id);
            return res.status(404).json({ message: 'Voter not found.' });
        }
        const voterHouse = voter.house_id;
        console.log('createVote: Voter found - house:', voterHouse ? voterHouse._id : 'N/A');

        // 2. Get candidate's house and nomination details
        const nomination = await Nomination.findById(nomination_id)
            .populate({ path: 'user_id', populate: { path: 'house_id' } })
            .populate('house');
        if (!nomination) {
            console.error('createVote: Nomination not found for nomination_id:', nomination_id);
            return res.status(404).json({ message: 'Nomination not found.' });
        }
        if (!nomination.user_id) {
            console.error('createVote: Candidate user not found for nomination_id:', nomination_id);
            return res.status(404).json({ message: 'Candidate user not found for this nomination.' });
        }
        const candidateHouse = nomination.house;
        console.log('createVote: Nomination found - candidate user_id:', nomination.user_id ? nomination.user_id._id : 'N/A', 'candidate house:', candidateHouse ? candidateHouse._id : 'N/A');

        // 3. Check position and voting period
        const position = await LeaderPosition.findById(position_id);
        if (!position) {
             console.error('createVote: Position not found for position_id:', position_id);
             return res.status(404).json({ message: 'Position not found.' });
        }
        console.log('createVote: LeaderPosition title:', position.title);

        // Check if voting period is active
        const now = new Date();
        if (position.voting_starts_at && now < position.voting_starts_at) {
            console.error('createVote: Voting has not started yet for position_id:', position_id);
            return res.status(400).json({ message: 'Voting has not started yet for this position.' });
        }
        if (position.voting_ends_at && now > position.voting_ends_at) {
            console.error('createVote: Voting has closed for position_id:', position_id);
            return res.status(400).json({ message: 'Voting has closed for this position.' });
        }

        if (position.winner) {
            return res.status(400).json({ message: 'Voting has closed for this position as results have been declared.' });
        }

        // 4. Check house restriction (sabhi positions house-specific hain ab)
        console.log('createVote: Checking house restriction...');
        console.log('createVote: Voter House ID:', voterHouse ? voterHouse._id.toString() : 'N/A');
        console.log('createVote: Candidate House ID:', candidateHouse ? candidateHouse._id.toString() : 'N/A');
        
        if (!voterHouse || !candidateHouse || voterHouse._id.toString() !== candidateHouse._id.toString()) {
            console.error('createVote: House mismatch - Voter house:', voterHouse ? voterHouse._id : 'N/A', 'Candidate house:', candidateHouse ? candidateHouse._id : 'N/A');
            return res.status(400).json({ message: 'You can only vote for candidates in your own house.' });
        }

        // 5. Check if user already voted for this position
        const existingVote = await Vote.findOne({ user_id, position_id });
        if (existingVote) {
            console.log('createVote: User already voted for this position:', position_id);
            return res.status(400).json({ message: 'You have already voted for this position.' });
        }

        const vote = new Vote({
            nomination_id,
            user_id,
            house_id: voterHouse._id,
            position_id
        });

        const createdVote = await vote.save();
        console.log('createVote: Vote successfully created:', createdVote._id);

        // ✅ IMPORTANT: Increment voteCount on Nomination
        console.log('Attempting to increment voteCount for nomination_id:', nomination_id);
        const nominationBeforeUpdate = await Nomination.findById(nomination_id);
        if (nominationBeforeUpdate) {
            console.log('createVote: Nomination before update - ID:', nomination_id, 'Current voteCount:', nominationBeforeUpdate.voteCount);
        }

        const updatedNomination = await Nomination.findByIdAndUpdate(
            nomination_id,
            { $inc: { voteCount: 1 } },
            { new: true }
        );
        if (updatedNomination) {
            console.log('createVote: Successfully updated Nomination. New voteCount:', updatedNomination.voteCount);
        } else {
            console.error('createVote: Nomination not found for increment after findByIdAndUpdate, ID:', nomination_id);
            return res.status(404).json({ message: 'Nomination not found for increment.' });
        }

        // ✅ Emit socket event with updated vote count
        const io = req.app.get('socketio');
        const emittedData = {
            nominationId: updatedNomination._id,
            voteCount: updatedNomination.voteCount
        };
        console.log(`createVote: Emitting nominationVoteCountUpdated with data:`, emittedData);
        io.emit('nominationVoteCountUpdated', emittedData);

        res.status(201).json(createdVote);
    } catch (error) {
        console.error('createVote: Error (Caught):', error.message, error.stack);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already voted for this position.' });
        }
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get logged in user votes
// @route   GET /api/votes/my-votes
// @access  Private
const getMyVotes = async (req, res) => {
    try {
        const { positionId } = req.query;
        let filter = { user_id: req.user.id };
        if (positionId) {
            filter.position_id = positionId;
        }
        const votes = await Vote.find(filter)
            .populate('nomination_id')
            .populate('position_id');
        res.json(votes);
    } catch (error) {
        console.error('Error in getMyVotes:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * ✅ COMPLETELY REWRITTEN getVoteResults
 * 
 * PEHLE KA MASLA:
 * - Aggregation pipeline bhot complex tha
 * - voteCount stale data use kar raha tha
 * - House-specific filtering sahi se nahi ho rahi thi
 * 
 * AB SAHI TARIKA:
 * - Simple loop with direct Vote.countDocuments()
 * - ACTUAL vote counts from Vote collection
 * - House-specific positions properly handled
 */
const getVoteResults = async (req, res) => {
    try {
        console.log('=== getVoteResults START ===');
        console.log('User info:', {
            userId: req.user._id,
            userHouseId: req.user.house_id,
            userRole: req.user.role
        });

        // Step 1: Decide positions filter based on user role
        let positionFilter = {};

        if (req.user.role === 'admin') {
            // Admin dekh sakta hai sab positions (har house ka)
            positionFilter = { house_id: { $exists: true } };
            console.log('Admin mode - showing all positions');
        } else {
            // Normal user sirf apne house ke positions dekh sakta hai
            positionFilter = { house_id: req.user.house_id };
            console.log(`User mode - showing positions for house: ${req.user.house_id}`);
        }

        // Step 2: Get all positions based on filter
        const positions = await LeaderPosition.find(positionFilter)
            .populate('house_id')
            .sort({ priority: 1 });

        console.log(`Found ${positions.length} positions`);

        // Step 3: Build results array by processing each position
        const results = [];

        for (const position of positions) {
            console.log(`\n--- Processing Position: ${position.title} ---`);

            // Get all APPROVED nominations for this position
            const nominations = await Nomination.find({
                position_id: position._id,
                status: 'approved'
            })
            .populate('user_id')
            .populate('house');

            console.log(`Found ${nominations.length} approved nominations`);

            // For each nomination, get ACTUAL vote count from Vote collection
            const nominationsWithVotes = [];

            for (const nomination of nominations) {
                // ✅ COUNT VOTES DIRECTLY FROM Vote COLLECTION
                const voteCount = await Vote.countDocuments({
                    nomination_id: nomination._id,
                    position_id: position._id
                });

                console.log(`  - ${nomination.user_id.full_name}: ${voteCount} votes`);

                nominationsWithVotes.push({
                    _id: nomination._id,
                    user_id: nomination.user_id._id,
                    full_name: nomination.user_id.full_name,
                    manifesto: nomination.manifesto,
                    status: nomination.status,
                    isWinner: nomination.isWinner,
                    photo: nomination.photo,
                    house: nomination.house,
                    vote_count: voteCount  // ✅ ACTUAL count, not stale voteCount field
                });
            }

            // Step 4: Get winner info
            let winner = null;

            if (position.overallWinner) {
                console.log('Winner found in position.overallWinner');
                
                const winningNomination = await Nomination.findById(position.overallWinner.nomination)
                    .populate('user_id')
                    .populate('house');

                if (winningNomination) {
                    const winnerVoteCount = await Vote.countDocuments({
                        nomination_id: winningNomination._id,
                        position_id: position._id
                    });

                    winner = {
                        _id: winningNomination.user_id._id,
                        full_name: winningNomination.user_id.full_name,
                        photo: winningNomination.photo,
                        house_name: winningNomination.house.name,
                        house_id: winningNomination.house._id,
                        vote_count: winnerVoteCount
                    };
                    console.log(`Winner: ${winner.full_name} with ${winner.vote_count} votes`);
                }
            } else {
                console.log('No winner declared yet for this position');
            }

            // Step 5: Push complete position result
            results.push({
                _id: position._id,
                position_title: position.title,
                house_id: position.house_id._id,
                house_name: position.house_id.name,
                house_color: position.house_id.color,
                winner: winner,
                nominations: nominationsWithVotes
            });
        }

        // Step 6: Fix photo URLs
        const host = `${req.protocol}://${req.get('host')}`;

        results.forEach(positionResult => {
            // Winner photo
            if (positionResult.winner?.photo) {
                positionResult.winner.photo = host + positionResult.winner.photo;
            } else if (positionResult.winner) {
                positionResult.winner.photo = host + '/uploads/default-profile.png';
            }

            // Nomination photos
            positionResult.nominations.forEach(nomination => {
                if (nomination.photo) {
                    nomination.photo = host + nomination.photo;
                } else {
                    nomination.photo = host + '/uploads/default-profile.png';
                }
            });
        });

        console.log('=== getVoteResults END - Sending results ===\n');
        res.json(results);

    } catch (error) {
        console.error('Error fetching vote results:', error.message, error.stack);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const declareResults = async (req, res) => {
    try {
        const { position_id } = req.body;
        if (!mongoose.Types.ObjectId.isValid(position_id)) {
            return res.status(400).json({ message: 'Invalid position ID' });
        }

        const position = await LeaderPosition.findById(position_id).populate('house_id');
        if (!position) {
            return res.status(404).json({ message: 'Leader Position not found.' });
        }

        // Check if voting has ended
        const now = new Date();
        if (position.voting_ends_at && now < position.voting_ends_at) {
            return res.status(400).json({ message: 'Voting has not ended yet for this position.' });
        }

        if (req.user.role === 'house_admin' && position.house_id && position.house_id.toString() !== req.user.house_id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to declare results for this position' });
        }

        // Get winner nomination (sabse zyada votes)
        const results = await Vote.aggregate([
            { $match: { position_id: new mongoose.Types.ObjectId(position_id) } },
            {
                $group: {
                    _id: "$nomination_id",
                    vote_count: { $sum: 1 }
                }
            },
            { $sort: { vote_count: -1 } },
            { $limit: 1 },
            {
                $lookup: {
                    from: 'nominations',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'nomination'
                }
            },
            { $unwind: '$nomination' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'nomination.user_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
        ]);

        if (results.length > 0) {
            const winner = results[0];

            // Update position with winner
            if (position.house_id) {
                const winnerHouseId = winner.nomination.house;

                const newWinnerEntry = {
                    house: winnerHouseId,
                    nomination: winner.nomination._id,
                    user: winner.user._id
                };

                const updatedPosition = await LeaderPosition.findOneAndUpdate(
                    { _id: position_id, 'houseWinners.house': winnerHouseId },
                    { '$set': { 'houseWinners.$': newWinnerEntry } },
                    { new: true }
                );

                if (!updatedPosition) {
                    await LeaderPosition.findByIdAndUpdate(
                        position_id,
                        { '$push': { houseWinners: newWinnerEntry } },
                        { new: true }
                    );
                }
            } else {
                await LeaderPosition.findByIdAndUpdate(
                    position_id,
                    {
                        overallWinner: {
                            nomination: winner.nomination._id,
                            user: winner.user._id
                        }
                    },
                    { new: true }
                );
            }

            // Set isWinner on nominations
            await Nomination.findByIdAndUpdate(
                winner.nomination._id,
                { isWinner: true },
                { new: true }
            );

            await Nomination.updateMany(
                { position_id: position_id, _id: { $ne: winner.nomination._id } },
                { isWinner: false }
            );

            // Emit socket event
            const io = req.app.get('socketio');
            io.emit('resultsDeclared', { position_id, winner });

            // Send notification
            const { createAndSendNotification } = require('../utils/notificationUtils');
            const updatedPositionForNotification = await LeaderPosition.findById(position_id);
            createAndSendNotification(io, {
                title: 'Winner Declared!',
                message: `${winner.user.full_name} has won the election for ${updatedPositionForNotification.title}`,
                type: 'voting',
                link: '/voting-results'
            });

            res.json({ message: 'Results declared', winner });
        } else {
            res.status(404).json({ message: 'No votes found for this position' });
        }
    } catch (error) {
        console.error('Error declaring results:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Reset vote results for a specific position
// @route   DELETE /api/votes/results/:positionId
// @access  Private/Admin
const resetVoteResults = async (req, res) => {
    console.log('[RESET] Function resetVoteResults was called.');
    try {
        const { positionId } = req.params;
        const { houseId } = req.query;
        console.log(`[RESET] Resetting results for positionId: ${positionId}, houseId: ${houseId || 'All Houses'}`);

        if (!mongoose.Types.ObjectId.isValid(positionId)) {
            console.log('[RESET] Invalid position ID');
            return res.status(400).json({ message: 'Invalid position ID' });
        }

        const position = await LeaderPosition.findById(positionId).populate('house_id');
        if (req.user.role === 'house_admin' && position.house_id && position.house_id.toString() !== req.user.house_id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to reset results for this position' });
        }

        const houseFilter = houseId ? { house_id: houseId } : {};
        const nominationHouseFilter = houseId ? { house: houseId } : {};

        // 1. Delete all votes
        const voteDeletionResult = await Vote.deleteMany({ position_id: positionId, ...houseFilter });
        console.log(`[RESET] Deleted ${voteDeletionResult.deletedCount} votes.`);

        // 2. Reset nominations
        const nominationUpdateResult = await Nomination.updateMany(
            { position_id: positionId, ...nominationHouseFilter },
            { $set: { isWinner: false, voteCount: 0, status: 'approved' } }
        );
        console.log(`[RESET] Updated ${nominationUpdateResult.modifiedCount} nominations.`);

        // 3. Clear winner from position
        if (position.house_id) {
            await LeaderPosition.findByIdAndUpdate(
                positionId,
                { $pull: { houseWinners: { house: houseId } } },
                { new: true }
            );
        } else {
            await LeaderPosition.findByIdAndUpdate(
                positionId,
                { $set: { overallWinner: null } },
                { new: true }
            );
        }

        console.log('[RESET] Position updated');

        res.json({ message: `Vote results for position ${positionId} ${houseId ? `in house ${houseId}` : ''} have been reset.` });
    } catch (error) {
        console.error('[RESET] Error resetting vote results:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = { getVotes, createVote, getMyVotes, getVoteResults, declareResults, resetVoteResults };