import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export function authMiddleware(requiredRole){
  return async (req, res, next) => {
    const auth = req.headers.authorization;
    if(!auth || !auth.startsWith('Bearer ')){
      console.log('Auth middleware: No authorization header or invalid format');
      return res.status(401).json({error:'Unauthorized'});
    }
    const token = auth.split(' ')[1];
    try{
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      // normalize to user object: either {student_id,..} or {admin_id,..}
      req.user = payload;
      console.log('Auth middleware: Token verified, role:', payload.role, 'required:', requiredRole);
      if(requiredRole && payload.role !== requiredRole){
        console.log('Auth middleware: Role mismatch - user has', payload.role, 'but needs', requiredRole);
        return res.status(403).json({error:'Forbidden - Invalid role'});
      }
      next();
    }catch(err){
      console.log('Auth middleware: Token verification failed:', err.message);
      return res.status(401).json({error:'Invalid token'});
    }
  }
}
