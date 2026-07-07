import prisma from "../config/prisma.js";
import bcrypt from "bcryptjs";
import { AppError } from "../utils/AppError.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

import { authSchemas } from "../schemas/authSchemas.js";

//REGISTER

export async function register({
  email,
  username,
  password,
  full_name,
  role,
  mobile,
}) {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new AppError("email is already registered", 401);

  const existingUsername = await prisma.user.findUnique({
    where: { username },
  });
  if (existingUsername) throw new AppError("username is already taken", 401);

  const password_hash = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      email,
      username,
      password_hash,
      full_name,
      role,
      mobile,
    },
  });
}
// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError("Invalid credentials", 401);

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) throw new AppError("Invalid credentials", 401);

  if (user.status === "suspended") throw new AppError("Account suspended", 403);
  return generateTokenPair(user);
}

// ─────────────────────────────────────────────
// GENERATE TOKEN PAIR — reusable helper
// ─────────────────────────────────────────────

export async function generateTokenPair(user) {
  const payload = {
    id: user.id,
    role: user.role,
    email: user.email,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ id: user.id });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt },
  });

  // Old expired tokens background cleanup
  prisma.refreshToken
    .deleteMany({
      where: { userId: user.id, expiresAt: { lt: new Date() } },
    })
    .catch(() => {});

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
    },
  };
}

// ─────────────────────────────────────────────
// ✅ REFRESH — token rotation ke saath (updated)
// ─────────────────────────────────────────────

export async function refresh(incomingToken) {
  // 1. JWT verify
  let payload;
  try {
    payload = verifyRefreshToken(incomingToken);
  } catch {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  // 2. DB mein check karo
  const stored = await prisma.refreshToken.findUnique({
    where: { token: incomingToken },
    include: { user: true },
  });

  if (!stored) throw new AppError("Refresh token not found", 401);
  if (stored.isRevoked) throw new AppError("Refresh token revoked", 401);
  if (stored.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { token: incomingToken } });
    throw new AppError("Refresh token expired", 401);
  }

  const user = stored.user;
  if (user.isSuspended) throw new AppError("Account suspended", 403);

  // 3. Old token revoke karo (rotation security)
  await prisma.refreshToken.update({
    where: { token: incomingToken },
    data: { isRevoked: true },
  });

  // 4. Naya token pair generate karo
  const accessToken = generateAccessToken({
    id: user.id,
    role: user.role,
    email: user.email,
  });
  const refreshToken = generateRefreshToken({ id: user.id });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt },
  });

  return { accessToken, refreshToken };
}

// ─────────────────────────────────────────────
// ✅ LOGOUT — specific token revoke (updated)
// ─────────────────────────────────────────────

export async function logout(userId, refreshToken) {
  if (!refreshToken) {
    // Token nahi mila — sab revoke karo as fallback
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
    return;
  }

  await prisma.refreshToken.updateMany({
    where: { token: refreshToken, userId },
    data: { isRevoked: true },
  });
}

// ─────────────────────────────────────────────
// ✅ LOGOUT ALL DEVICES (same — already correct tha)
// ─────────────────────────────────────────────

export async function logoutAllDevices(userId) {
  await prisma.refreshToken.updateMany({
    where: { userId },
    data: { isRevoked: true },
  });
}
