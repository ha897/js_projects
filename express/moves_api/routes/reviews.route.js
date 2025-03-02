import express from 'express';
import * as reviewsController from '../controllers/reviews.controller.js';
import { asyncHandler } from '../utils/helpers.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/:movieId', authenticateUser, asyncHandler(reviewsController.createReview));
router.get('/:movieId', asyncHandler(reviewsController.getReviewsByMovieId));

export default router;