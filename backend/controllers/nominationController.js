






const Nomination = require('../models/nominationModel');
const mongoose = require('mongoose');
const LeaderPosition = require('../models/leaderPositionModel'); // Added this line

// @desc    Get all nominations (for admin)



// @route   GET /api/nominations



// @access  Private/Admin



const getNominations = async (req, res) => {



    try {



        const { houseId } = req.query;







                let query = {};



                if (houseId) {



                    query.house = houseId;



                }











        const nominations = await Nomination.find(query)



            .populate('user_id', 'full_name profile_picture')



            .populate('position_id', 'title')



            .populate('house', 'name color'); // Populate house with name and color



        res.json(nominations);



    } catch (error) {



        console.error('Error in getNominations:', error);



        res.status(500).json({ message: 'Server Error', error: error.message });



    }



};


const getNominationById = async (req, res) => {
    try {
        const nomination = await Nomination.findById(req.params.id)
            .populate('user_id', 'full_name profile_picture')
            .populate('position_id', 'title');
        if (!nomination) {
            return res.status(404).json({ message: 'Nomination not found' });
        }
        res.json(nomination);
    } catch (error) {
        console.error('Error in getNominationById:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};








// @desc    Get approved nominations (for users)



// @route   GET /api/nominations/approved



// @access  Private







const getApprovedNominations = async (req, res) => {







    try {







        let filter = {







            status: 'approved',







        };















        // If user is not admin, filter by their house







        if (req.user.role !== 'admin') {







            if (req.user.house_id) {







                filter.house = req.user.house_id._id;







            } else {







                // If a non-admin user has no house, they shouldn't see any nominations.







                // Setting a dummy house filter that won't match anything.







                filter.house = new mongoose.Types.ObjectId('000000000000000000000000');







            }







        }















        const nominations = await Nomination.find(filter)







            .populate('user_id', 'full_name profile_picture branch year email phone')







            .populate('position_id', 'title')







            .populate('house', 'name');















        res.json(nominations);







    } catch (error) {







        console.error('Error in getApprovedNominations:', error);







        res.status(500).json({ message: 'Server Error', error: error.message });







    }







};







// @desc    Create a nomination



// @route   POST /api/nominations



// @access  Private



const createNomination = async (req, res) => {







    try {







                const { position_id, manifesto } = req.body;











                if (!position_id || !manifesto) {







                    return res.status(400).json({ message: 'Please provide position_id and manifesto.' });







                }











                const user_id = req.user.id;







                const house_id = req.user.house_id;



















































        if (!house_id) {







            return res.status(400).json({ message: 'You must be in a house to create a nomination.' });







        }











        const existingNomination = await Nomination.findOne({ user_id, position_id });







        if (existingNomination) {







            return res.status(400).json({ message: 'You have already nominated yourself for this position.' });







        }











        const nomination = new Nomination({







            user_id,







            position_id,







            manifesto,







            house: house_id,







            photo: req.file ? `/uploads/${req.file.filename}` : null







        });











        const createdNomination = await nomination.save();







        res.status(201).json(createdNomination);







    } catch (error) {







        console.error('Error in createNomination:', error);







        if (error.name === 'ValidationError') {







            const messages = Object.values(error.errors).map(val => val.message);







            return res.status(400).json({ message: messages.join(', ') });







        }







        res.status(500).json({ message: 'Server Error', error: error.message });







    }







};







// @desc    Update a nomination (e.g., status)



// @route   PUT /api/nominations/:id



// @access  Private/Admin



const updateNomination = async (req, res) => {



    try {



                        const nomination = await Nomination.findById(req.params.id);



                



                        if (!nomination) {



                            return res.status(404).json({ message: 'Nomination not found' });



                        }



                



                        // Check if status is being changed to 'approved'



                        if (req.body.status === 'approved' && nomination.status !== 'approved') {



                            const User = require('../models/userModel');



                            const user = await User.findById(nomination.user_id);



                            if (user) {



                                user.is_candidate = true;



                                await user.save();



                            }



                        }



                



                        const updatedNomination = await Nomination.findByIdAndUpdate(



                            req.params.id,



                            { status: req.body.status || nomination.status },



                            { new: true }



                        );

        if (updatedNomination.status === 'approved') {
            const io = req.app.get('socketio');
            const populatedNomination = await Nomination.findById(updatedNomination._id)
                .populate('user_id', 'full_name profile_picture branch year email phone')
                .populate('position_id', 'title')
                .populate('house', 'name');
            io.emit('newNomination', populatedNomination);
        }

        res.json(updatedNomination);



    } catch (error) {



        console.error('Error in updateNomination:', error);



        res.status(500).json({ message: 'Server Error', error: error.message });



    }



};







// @desc    Delete a nomination



// @route   DELETE /api/nominations/:id



// @access  Private/Admin



const deleteNomination = async (req, res) => {
    try {
        const nomination = await Nomination.findById(req.params.id);

        if (!nomination) {
            return res.status(404).json({ message: 'Nomination not found' });
        }

        const wasWinner = nomination.isWinner;
        const positionId = nomination.position_id;
        const houseId = nomination.house;
        const nominationId = nomination._id;

        await Nomination.findByIdAndDelete(req.params.id);

        // Delete all votes associated with this nomination
        await Vote.deleteMany({ nomination_id: nominationId });

        // If the deleted nomination was a winner, update LeaderPosition and House
        if (wasWinner) {
            // Update LeaderPosition: unset winner and nomination fields
            await LeaderPosition.findByIdAndUpdate(
                positionId,
                { $pull: { houseWinners: { nomination: nominationId } } },
                { new: true }
            );

            // Update House: remove the winner entry from the winners array
            await House.findByIdAndUpdate(
                houseId,
                { $pull: { winners: { nomination: nominationId } } },
                { new: true }
            );
        }

        res.json({ message: 'Nomination removed and associated data updated' });
    } catch (error) {
        console.error('Error in deleteNomination:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get declared winners for an event and position
// @route   GET /api/nominations/winners?event_id=<id>&position_id=<id>
// @access  Private
const getWinners = async (req, res) => {
    const { position_id, houseId } = req.query;

    try {
        if (!position_id) {
            return res.status(400).json({ message: 'Please provide a position_id' });
        }

        const leaderPosition = await LeaderPosition.findById(position_id);

        if (!leaderPosition) {
            return res.status(404).json({ message: 'Leader position not found' });
        }

        let winnerNominations = [];
        if (leaderPosition.houseWinners && leaderPosition.houseWinners.length > 0) {
            const filteredHouseWinners = houseId
                ? leaderPosition.houseWinners.filter(hw => hw.house.toString() === houseId)
                : leaderPosition.houseWinners;

            const nominationIds = filteredHouseWinners.map(hw => hw.nomination);

            winnerNominations = await Nomination.find({ _id: { $in: nominationIds } })
                .populate('user_id', 'full_name profile_picture branch year email phone')
                .populate('position_id', 'title')
                .populate('house', 'name color')
                .select('+photo');
        }

        const winnersWithFullPhotoUrl = winnerNominations.map(winner => {
            const photoUrl = winner.photo
                ? `${req.protocol}://${req.get('host')}${winner.photo}`
                : 'https://placehold.jp/150x150.png?text=No+Photo';
            return { ...winner.toObject(), photo: photoUrl };
        });

        res.json(winnersWithFullPhotoUrl);
    } catch (error) {        console.error('Error in getWinners:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const House = require('../models/houseModel');

// @desc    Declare a nomination as winner
// @route   PUT /api/admin/nominations/:id/declare-winner
// @access  Private/Admin
const declareWinner = async (req, res) => {
    try {
        const nominationId = req.params.id;

        // Find the nomination to be declared as winner
        const nomination = await Nomination.findById(nominationId);

        if (!nomination) {
            return res.status(404).json({ message: 'Nomination not found' });
        }

        // Find the leader position
        const leaderPosition = await LeaderPosition.findById(nomination.position_id);

        if (!leaderPosition) {
            return res.status(404).json({ message: 'Leader position not found' });
        }

        // Remove any existing winner for this position within the same house
        leaderPosition.houseWinners = leaderPosition.houseWinners.filter(
            (hw) => !hw.house.equals(nomination.house)
        );


        // Add the new winner
        leaderPosition.houseWinners.push({
            house: nomination.house,
            nomination: nomination._id,
            user: nomination.user_id,
        });

        await leaderPosition.save();

        // Ensure the specific nomination is marked as winner (optional, but good for local context)
        const updatedNomination = await Nomination.findByIdAndUpdate(
            nominationId,
            { isWinner: true, status: 'winner' }, // Also update status to 'winner'
            { new: true }
        );

        // Reset isWinner for any other nomination in the same position and house that was previously a winner
        await Nomination.updateMany(
            {
                position_id: nomination.position_id,
                house: nomination.house,
                _id: { $ne: nominationId },
                isWinner: true,
            },
            { $set: { isWinner: false, status: 'approved' } } // Set status to approved for others
        );

        // Update the corresponding house with the winner information
        const house = await House.findById(nomination.house);
        if (house) {
            // Check if a winner for this position already exists in the house
            const existingWinnerIndex = house.winners.findIndex(
                (winner) => winner.position_id.toString() === nomination.position_id.toString()
            );

            if (existingWinnerIndex > -1) {
                // Update existing winner
                house.winners[existingWinnerIndex] = {
                    position_id: nomination.position_id,
                    user_id: nomination.user_id,
                    nomination_id: nomination._id,
                };
            } else {
                // Add new winner
                house.winners.push({
                    position_id: nomination.position_id,
                    user_id: nomination.user_id,
                    nomination_id: nomination._id,
                });
            }
                    await house.save();
                } // Closing brace for `if (house)` block
        
                // Emit Socket.IO event for winner declared
                const io = req.app.get('socketio');
                if (io) {
                    // Populate necessary fields for the frontend
                    const populatedWinner = await Nomination.findById(updatedNomination._id)
                        .populate('user_id', 'full_name profile_picture branch year email phone')
                        .populate('position_id', 'title')
                        .populate('house', 'name color');
        
                    io.emit('winnerDeclared', populatedWinner);
                    console.log(`Socket.IO: Emitted 'winnerDeclared' for nomination ID: ${populatedWinner._id}`);
                }
        
                res.json(updatedNomination);    } catch (error) {
        console.error('Error in declareWinner:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = { getNominationById, getNominations, getApprovedNominations, createNomination, updateNomination, deleteNomination, getWinners, declareWinner };






