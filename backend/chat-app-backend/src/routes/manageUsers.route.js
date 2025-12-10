import express from "express";
import {banUser,unbanUser,getBnnedUsers,getAllUsers} from "../controllers/manageUsers.controller.js"
import {protectRoute} from "../middleware/auth.middleware.js"
const router = express.Router();

router.put("/ban-user/:id",protectRoute,banUser);
router.put("/unban-user/:id",protectRoute,unbanUser);
router.get("/getBannedusers",protectRoute,getBnnedUsers);
router.get("/",protectRoute,getAllUsers);  // GET /api/manageUsers - Returns all users for contact list




export default router;