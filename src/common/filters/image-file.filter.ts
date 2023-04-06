export const imageFileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|jfif)$/i)) {
        return callback(null, false);
    }
    callback(null, true);
};