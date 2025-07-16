const multer = require('multer');
const path = require('path');

const MAX_SIZE_DEFAULT = 3 * 1024 * 1024; 
const MAX_SIZE_PROFILE = 5 * 1024 * 1024; 


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = './assets/'; 

    switch (file.fieldname) {
      case 'cv':
        uploadPath += 'cv';
        break;
      case 'lamaran':
        uploadPath += 'lamaran';
        break;
      case 'ktp':
        uploadPath += 'identitas';
        break;
      case 'krrs':
        uploadPath += 'krrs';
        break;
      case 'profile':
        uploadPath += 'pp';
        break;
      case 'deals':
        uploadPath += 'dpict';
        break;
      case 'event':
        uploadPath += 'pic';
        break;
      case 'intern':
        uploadPath += 'internpic';
        break;
      default:
        return cb(new Error('Invalid fieldname'), false);
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + extension);
  }
});

const fileFilterPDF = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed for this field'), false);
  }
};

const fileFilterImage = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Only JPG and PNG files are allowed for this field'), false);
  }
};


const fileFilter = (req, file, cb) => {
  if (['cv', 'lamaran', 'krrs'].includes(file.fieldname)) {
    return fileFilterPDF(req, file, cb);
  }
  if (['ktp', 'profile','deals','event','intern'].includes(file.fieldname)) {
    return fileFilterImage(req, file, cb);
  }
  cb(new Error('Invalid fieldname'), false);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
}).fields([
  { name: 'cv', maxCount: 1 },
  { name: 'lamaran', maxCount: 1 },
  { name: 'ktp', maxCount: 1 },
  { name: 'krrs', maxCount: 1 },
  { name: 'profile', maxCount: 1 },
  { name: 'deals', maxCount: 1 },
  { name: 'event', maxCount: 1 },
  { name: 'intern', maxCount: 1 }
]);

const uploadMiddleware = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    const errors = [];

    for (const field in req.files) {
      req.files[field].forEach(file => {
        if (['profile', 'deals', 'event','intern'].includes(file.fieldname) && file.size > MAX_SIZE_PROFILE) {
          errors.push(`${file.fieldname} size should not exceed 5MB`);
        } else if (!['cv','lamaran','ktp','krrs'].includes(file.fieldname) && file.size > MAX_SIZE_DEFAULT) {
          errors.push(`${file.fieldname} size should not exceed 1MB`);
        }
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: errors });
    }

    next();
  });
};


module.exports = uploadMiddleware;
