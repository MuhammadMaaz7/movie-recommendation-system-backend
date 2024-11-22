// middleware/adminMiddleware.js
const adminMiddleware = (req, res, next) => {
    if (!req.user?.isAdmin) {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    next();
};

module.exports = { adminMiddleware };