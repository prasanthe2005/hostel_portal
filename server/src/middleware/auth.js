import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export function authMiddleware(requiredRole){
  return async (req, res, next) => {
    const auth = req.headers.authorization;
    if(!auth || !auth.startsWith('Bearer ')) return res.status(401).json({error:'Unauthorized'});
    const token = auth.split(' ')[1];
    try{
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      // normalize to user object: either {student_id,..} or {admin_id,..}
      req.user = payload;
      if(requiredRole && payload.role !== requiredRole) return res.status(403).json({error:'Forbidden'});
      next();
    }catch(err){
      return res.status(401).json({error:'Invalid token'});
    }
  }
}
