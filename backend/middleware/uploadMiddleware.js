const multer = require('multer');
const path = require('path');

// Configuration du stockage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Les fichiers iront dans le dossier uploads/
    },
    filename: (req, file, cb) => {
        // Nom unique : date-nomdufichier
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Filtrer pour n'accepter que les PDF ou CSV
const fileFilter = (req, file, cb) => {
    const m = file.mimetype || '';
    if (m.includes('pdf') || m.includes('csv') || m === 'application/vnd.ms-excel') {
        cb(null, true);
    } else {
        cb(new Error('Seuls les fichiers PDF ou CSV sont autorisés !'), false);
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;