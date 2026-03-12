import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const type = req.baseUrl.split('/').pop();
    cb(null, path.join(__dirname, `../uploads/OnlineImages/${type.charAt(0).toUpperCase() + type.slice(1)}Images`));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

export default upload;
