import bcrypt from "bcrypt";
import prisma from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import { generateToken } from "../../utils/jwt.js";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "CUSTOMER" | "TECHNICIAN" | "ADMIN";
}

const registerUser = async (payload: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new AppError(409, "User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  
  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      phone: payload.phone,
      role: payload.role,
      ...(payload.role === "TECHNICIAN" && {
        technicianProfile: {
          create: {}, 
        },
      }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  return user;
};

const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  if (user.status === "BANNED") {
    throw new AppError(403, "Your account has been banned");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError(401, "Invalid email or password");
  }

  const jwtPayload = { userId: user.id, role: user.role };

  const accessToken = generateToken(
    jwtPayload,
    process.env.JWT_ACCESS_SECRET as string,
    "1d"
  );
  const refreshToken = generateToken(
    jwtPayload,
    process.env.JWT_REFRESH_SECRET as string,
    "30d"
  );

  return { accessToken, refreshToken };
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
      technicianProfile: true,
    },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return user;
};

export const AuthServices = { registerUser, loginUser, getMe };