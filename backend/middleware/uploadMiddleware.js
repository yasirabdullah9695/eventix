
const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Init upload
const upload = multer({
    storage: storage,
    limits: {fileSize: 10000000}, // 10MB
    fileFilter: function(req, file, cb){
        checkFileType(file, cb);
    }
}).fields([
    { name: 'cover_image', maxCount: 1 },
    { name: 'payment_qr', maxCount: 1 },
    { name: 'payment_screenshot', maxCount: 1 },
    { name: 'image', maxCount: 1 } // Added for gallery images
]);

// Check file type
function checkFileType(file, cb){
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname){
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

// Custom error handling for Multer
module.exports = (req, res, next) => {
    console.log(`[Upload Middleware] Request: ${req.method} ${req.url}`);
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            console.error('Multer Error:', err.message);
            return res.status(400).json({ message: `File upload error: ${err.message}` });
        } else if (err) {
            // An unknown error occurred when uploading.
            console.error('Unknown Upload Error:', err);
            return res.status(400).json({ message: err });
        }
        // Everything went fine.
        next();
    });
};
