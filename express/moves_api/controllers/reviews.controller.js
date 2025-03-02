import { Review, User, Movie } from "../models/index.js";

export async function createReview(req, res) {
    const review = await Review.create({
        rating: req.body.rating,
        text: req.body.text,
        // لان البراميترز يكون سترنج
        movieId: +req.params.movieId,
        userId: req.user.id
    });

    res.status(201).json(review);
    res.status(500).json({ message: error.message });
}

export async function getReviewsByMovieId(req, res) {
    const reviews = Review.findAll({
        where: { movieId: +req.params.movieId },
        // احضار البيناات من جداول اخرى مرتبطة
        include: [
            {
                model: User,
                as: "user",
                attributes: ["id", "name"]
            }, {
                model: Movie,
                as: "movie",
                attributes: ["id", "name"]
            }
        ]
    })
    res.json(reviews)

}