import express from 'express';
import * as watchlistController from '../controllers/watchlist.controller.js';
import { asyncHandler } from '../utils/helpers.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/:movieId', authenticateUser, asyncHandler(watchlistController.addToWatchList));
router.get('/', authenticateUser, asyncHandler(watchlistController.getWatchList));
router.delete('/:movieId', authenticateUser, asyncHandler(watchlistController.removeFromWatchList));

export default router;