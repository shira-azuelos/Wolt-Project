import jwt from "jsonwebtoken"
export const auth = (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return next({ msg: 'Authorization header missing', status: 401 });
    }
    const [, token] = authorization.split(' ');
    if (!token) {
        return next({ msg: 'Token missing', status: 401 });
    }
    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.user = user;
        return next();
    } catch (error) {
        console.error('JWT verification error:', error.message);
        return next({ msg: 'Invalid or expired token', status: 401 });
    }
};
export const optionalAuth = (req, res, next) => {
    const { authorization } = req.headers;    
    if (!authorization || authorization.split(' ').length < 2) {
        req.user = null;
        return next(); 
    } 
    const [, token] = authorization.split(' ');
    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.user = user; 
        return next();
    } catch (error) {
        req.user = null;
        return next(); 
    }
};
export const hasRole = (requiredRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.status) {
            return next({ msg: 'User role information missing or not authenticated', status: 403 });
        }
        const userStatus = req.user.status;
        const userRoles = Array.isArray(userStatus) ? userStatus : [userStatus];        
        const isAuthorized = requiredRoles.some(role => userRoles.includes(role));
        if (isAuthorized) {
            return next(); 
        } else {
            return next({ msg: `Access Forbidden: Required roles are ${requiredRoles.join(', ')}`, status: 403 });
        }
    }
};