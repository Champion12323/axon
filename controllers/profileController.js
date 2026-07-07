import { asyncHandler } from '../utils/asyncHandler.js';
import { profileService } from '../services/profileService.js';
// A simple helper to ensure consistency
const formatUserResponse = (user) => ({
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    username: user.username,
    role: user.role,
    bio: user.bio,
    avatar_url: user.avatar_url,
    total_followers: user.total_followers,
    content_types: user.content_type,
    rating: user.rating
});

export const profileController = {
    getProfile: asyncHandler(async (req, res) => {  
        const user = await profileService.getProfile(req.user.id);
        res.json({
            success: true,
            data: formatUserResponse(user)
        });
    }),

    updateProfile: asyncHandler(async (req, res) => {
        const updatedUser = await profileService.updateProfile(req.user.id, req.body);
        res.json({
            success: true,
            data: formatUserResponse(updatedUser)
        });
    }),
    
    // Stub for role-specific - implement as needed
    getInfluencerProfile: asyncHandler(async (req, res) => {
        res.json({ success: true, message: 'Influencer profile stub' });
    }),

    getClientProfile: asyncHandler(async (req, res) => {
        res.json({ success: true, message: 'Client profile stub' });
    })
};

