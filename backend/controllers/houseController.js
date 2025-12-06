
const House = require('../models/houseModel');

// @desc    Get all houses
// @route   GET /api/houses
// @access  Public
const getHouses = async (req, res) => {
    try {
        const houses = await House.find({}).lean();
        
        // If no houses exist, create default houses
        if (houses.length === 0) {
            const defaultHouses = [
                { name: 'Green House', color: '#22C55E' },
                { name: 'Red House', color: '#EF4444' },
                { name: 'Blue House', color: '#3B82F6' },
                { name: 'Yellow House', color: '#EAB308' }
            ];
            
            const createdHouses = await House.insertMany(defaultHouses);
            return res.json(createdHouses);
        }
        
        res.json(houses);
    } catch (error) {
        console.error('Error in getHouses:', error);
        res.status(500).json({ 
            message: 'Server Error', 
            error: process.env.NODE_ENV === 'development' ? error.message : undefined 
        });
    }
};

// @desc    Create a house
// @route   POST /api/houses
// @access  Private/Admin
const createHouse = async (req, res) => {
    const { name, color, logo_url, description } = req.body;

    try {
        const house = new House({
            name,
            color,
            logo_url,
            description,
        });

        const createdHouse = await house.save();
        res.status(201).json(createdHouse);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a house
// @route   PUT /api/houses/:id
// @access  Private/Admin
const updateHouse = async (req, res) => {
    try {
        const house = await House.findById(req.params.id);

        if (!house) {
            return res.status(404).json({ message: 'House not found' });
        }

        const updatedHouse = await House.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedHouse);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a house
// @route   DELETE /api/houses/:id
// @access  Private/Admin
const deleteHouse = async (req, res) => {
    try {
        const house = await House.findById(req.params.id);

        if (!house) {
            return res.status(404).json({ message: 'House not found' });
        }

        await House.findByIdAndDelete(req.params.id);
        res.json({ message: 'House removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single house by ID
// @route   GET /api/houses/:id
// @access  Public
const getHouseById = async (req, res) => {
    try {
        const house = await House.findById(req.params.id);

        if (!house) {
            return res.status(404).json({ message: 'House not found' });
        }

        res.json(house);
    } catch (error) {
        console.error('Error in getHouseById:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = { getHouses, createHouse, updateHouse, deleteHouse, getHouseById };
