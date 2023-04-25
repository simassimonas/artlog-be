import * as multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

export const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images/users');
  },
  filename: (req, file, cb) => {
    const name = `user-${uuidv4()}.png`;
    cb(null, name);
  },
});
