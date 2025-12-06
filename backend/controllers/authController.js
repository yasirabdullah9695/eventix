
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { full_name, email, password, phone, branch, year, house_id, enrollment_number } = req.body;

    try {
        const normalizedEmail = email.trim().toLowerCase();
        const userExists = await User.findOne({ email: normalizedEmail });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            full_name,
            email: normalizedEmail,
            password,
            phone,
            branch,
            year,
            house_id,
            enrollment_number,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                branch: user.branch,
                year: user.year,
                house_id: user.house_id,
                enrollment_number: user.enrollment_number,
                token: generateToken(user),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const normalizedEmail = email.trim().toLowerCase();
        console.log('Login attempt - Received email:', normalizedEmail);
        console.log('Login attempt - Received password:', password ? '[PASSWORD_PROVIDED]' : '[NO_PASSWORD]');
        const user = await User.findOne({ email: normalizedEmail }).populate('house_id');
        console.log('Login attempt - User found:', user ? user.email : 'None');

        if (!user || !user.password) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.json({
            _id: user._id,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            branch: user.branch,
            year: user.year,
            house: user.house_id ? {
                _id: user.house_id._id,
                name: user.house_id.name,
                color: user.house_id.color
            } : null,
            enrollment_number: user.enrollment_number,
            role: user.role,
            profile_picture: `http://localhost:5000${user.profile_picture || '/uploads/default-profile.png'}`,
            token: generateToken(user),
        });
    } catch (error) {
        console.error('Error during login for email:', email, error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Authenticate admin user & get token
// @route   POST /api/auth/admin-login
// @access  Public
const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const normalizedEmail = email.trim().toLowerCase();
        console.log(`Admin login attempt for email: ${normalizedEmail}`);
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            console.log(`Admin login failed: User not found for email ${normalizedEmail}`);
            return res.status(401).json({ message: 'Not authorized as an admin' });
        }
        
        if (user.role !== 'admin') {
            console.log(`Admin login failed: User ${normalizedEmail} has role ${user.role}, not 'admin'`);
            return res.status(401).json({ message: 'Not authorized as an admin' });
        }

        console.log(`Admin login: User found, checking password for ${normalizedEmail}`);
        console.log(`Stored password hash (first 10 chars): ${user.password ? user.password.substring(0, 10) : 'N/A'}`);
        console.log(`Password from request: ${password ? '[PROVIDED]' : '[NOT PROVIDED]'}`);

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log(`Admin login failed: Password mismatch for ${normalizedEmail}`);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.json({
            _id: user._id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            token: generateToken(user),
        });
    } catch (error) {
        console.error(`Error during admin login for email: ${email}`, error);
        res.status(500).json({ message: 'Server Error', details: error.message, stack: error.stack });
    }
};

// Generate JWT
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            branch: user.branch,
            year: user.year,
            house_id: user.house_id ? (user.house_id._id || user.house_id).toString() : null,
            enrollment_number: user.enrollment_number,
        },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};


// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.full_name = req.body.full_name || user.full_name;
        user.phone = req.body.phone || user.phone;
        user.branch = req.body.branch || user.branch;
        user.year = req.body.year || user.year;
        user.house_id = req.body.house_id || user.house_id;
        user.enrollment_number = req.body.enrollment_number || user.enrollment_number;

        // Handle profile picture upload
        if (req.files && req.files.image && req.files.image[0]) {
            user.profile_picture = `/uploads/${req.files.image[0].filename}`;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            full_name: updatedUser.full_name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            branch: updatedUser.branch,
            year: updatedUser.year,
            house: updatedUser.house,
            enrollment_number: updatedUser.enrollment_number,
            profile_picture: updatedUser.profile_picture, // Include profile_picture in response
            token: generateToken(updatedUser),
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};




const getMe = async (req, res) => {
    try {
        console.log('getMe - req.user:', req.user);
        const user = await User.findById(req.user._id).populate('house_id');
        
        if (user) {
            res.json({
                _id: user._id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                branch: user.branch,
                year: user.year,
                house: user.house_id ? {
                    _id: user.house_id._id,
                    name: user.house_id.name,
                    color: user.house_id.color
                } : null,
                house_id: user.house_id ? user.house_id._id : null,
                enrollment_number: user.enrollment_number,
                role: user.role,
                profile_picture: `http://localhost:5000${user.profile_picture || '/uploads/default-profile.png'}`, // Ensure default if null and make absolute
            });
        } else {
            console.log('getMe - User not found for id:', req.user._id);
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('getMe - Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { registerUser, loginUser, adminLogin, updateUserProfile, getMe };
