const jwt = require('jsonwebtoken');

const authMiddleware = async(req, res, next) => {
    try {
        const token = req.cookies.token;
        if(!token) {
            return res.redirect('/login')
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
        
    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Error"})
    }
}

module.exports = authMiddleware;