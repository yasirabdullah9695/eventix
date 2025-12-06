
const GalleryImage = require('../models/galleryImageModel');

// @desc    Get all gallery images
// @route   GET /api/gallery
// @access  Public
const getGalleryImages = async (req, res) => {
    try {
        const { year, category } = req.query;
        let filter = {};

        if (year) {
            filter.year = year;
        }

        if (category && category !== 'all') {
            filter.category = category;
        }

        const images = await GalleryImage.find(filter).sort({ year: -1, month: -1 });
        res.json(images);
    } catch (error) {
        console.error("Error fetching gallery images:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Upload a gallery image
// @route   POST /api/gallery
// @access  Private/Admin
const uploadGalleryImage = async (req, res) => {
    try {
        const { title, category, year, month } = req.body;
        const image_url = `/uploads/${req.files.image[0].filename}`;

        const image = new GalleryImage({
            title,
            category,
            year,
            month,
            image_url
        });

        const createdImage = await image.save();
        res.status(201).json(createdImage);
    } catch (error) {
        console.error("Error uploading gallery image:", error);
        res.status(500).json({ message: 'Failed to upload image', error: error.message });
    }
};

// @desc    Update a gallery image
// @route   PUT /api/gallery/:id
// @access  Private/Admin
const updateGalleryImage = async (req, res) => {
    try {
        const { title, category, year, month } = req.body;
        let image = await GalleryImage.findById(req.params.id);

        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        image.title = title || image.title;
        image.category = category || image.category;
        image.year = year || image.year;
        image.month = month || image.month;

        if (req.files && req.files.image && req.files.image.length > 0) {
            image.image_url = `/uploads/${req.files.image[0].filename}`;
        }

        const updatedImage = await image.save();
        res.json(updatedImage);
    } catch (error) {
        console.error("Error updating gallery image:", error);
        res.status(500).json({ message: 'Failed to update image', error: error.message });
    }
};

// @desc    Delete a gallery image
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
const deleteGalleryImage = async (req, res) => {
    try {
        const image = await GalleryImage.findById(req.params.id);

        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        await GalleryImage.findByIdAndDelete(req.params.id);
        res.json({ message: 'Image removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getGalleryImages, uploadGalleryImage, updateGalleryImage, deleteGalleryImage };
