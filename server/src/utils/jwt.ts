import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'pinklet-secret'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'

export function signToken(payload: { userId: string; role: string }) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions)
}

export function verifyToken(token: string) {
  const decoded = jwt.verify(token, JWT_SECRET) as {
    userId?: string
    id?: string
    role: string
  }

  return {
    userId: decoded.userId ?? decoded.id ?? "",
    role: decoded.role,
  }
}