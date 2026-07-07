import express from "express";
import { profileController } from "../controllers/profileController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// Apply authenticate to all routes in this router to avoid repetition
router.use(authenticate);

// Standard Profile Routes
router.get('/me', profileController.getProfile);           
router.patch('/me', profileController.updateProfile);      

// Role-Specific Routes
router.get('/influencer', profileController.getInfluencerProfile); 
router.get('/client', profileController.getClientProfile);

export default router;

