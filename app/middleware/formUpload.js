const multer = require('multer');
const path = require('path');

const MAX_SIZE_FORM_FILES = 5 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // All form files go to /forms directory
    cb(null, './assets/forms');
  },
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + extension);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    // Images
    'image/jpeg',
    'image/png', 
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    // Archives
    'application/zip',
    'application/x-rar-compressed'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed. Supported formats: JPG, PNG, PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, ZIP, RAR'), false);
  }
};

const formUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_SIZE_FORM_FILES
  }
}).any();

const formUploadMiddleware = (req, res, next) => {
  formUpload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size should not exceed 5MB' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (req.files && req.files.length > 0) {
      const organizedFiles = {};
      req.files.forEach(file => {
        if (file.size > MAX_SIZE_FORM_FILES) {
          return res.status(400).json({ 
            error: `File ${file.originalname} size should not exceed 5MB `
          });
        }
        
        if (!organizedFiles[file.fieldname]) {
          organizedFiles[file.fieldname] = [];
        }
        organizedFiles[file.fieldname].push(file);
      });
      req.files = organizedFiles;
    }
    next();
  });
};

module.exports = formUploadMiddleware;