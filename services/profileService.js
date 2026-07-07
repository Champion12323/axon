
import { AppError } from "../utils/AppError.js";
import prisma from "../config/prisma.js";

export const profileService = {
  async getProfile(userId) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) throw new AppError("User not found", 404);

    if (user.role === "INFLUENCER") {
      return await prisma.influencer_profiles.findUnique({
        where: { userId: userId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              full_name: true,
              location: true,
              role: true,
            },
          },
        },
      });
    }

    if (user.role === "CLIENT") {
      return await prisma.client_profiles.findUnique({
        where: { userId: userId },
        include: {
          user: {
            select: {
              id: true,
              company_name: true,
              industry: true,
              description: true,
              email: true,
              location: true,
              role: true,
            },
          },
        },
      });
    }

    throw new AppError("Invalid user role", 400);
  },
  async updateProfile(userId, profileData) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) throw new AppError("User not found", 404);

    const updateData = {
      full_name: profileData.full_name,
      username: profileData.username,
      avatar_url: profileData.avatar_url,
    };

    if (user.role === "INFLUENCER") {
      return await prisma.users.update({
        where: { id: userId },
        data: {
          ...updateData,
          influencer_profile: {
            update: {
              total_followers: profileData.total_followers,
              platforms: profileData.platforms,
              avg_views: profileData.avg_views,
              portfolio: profileData.portfolio,
            },
          },
        },
        include: { influencer_profile: true },
      });
    }

    if (user.role === "CLIENT") {
      return await prisma.users.update({
        where: { id: userId },
        data: {
          ...updateData,
          client_profile: {
            update: {
              company_name: profileData.company_name,
              industry: profileData.industry,
              description: profileData.description,
            },
          },
        },
        include: { client_profile: true },
      });
    }

    throw new AppError("Invalid role for profile update", 400);
  },
};

