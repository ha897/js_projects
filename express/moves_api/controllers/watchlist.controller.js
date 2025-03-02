import { WatchList, Movie } from '../models/index.js';

export async function addToWatchList(req, res) {
    const watchlist = await WatchList.create({
        movieId: req.params.movieId,
        userId: req.user.id
    });

    res.status(201).json(watchlist);

}

export async function getWatchList(req, res) {
    const watchlist = await WatchList.findAll({
        where: { userId: req.user.id },
        include: [{
            model: Movie,
            as: 'movie',
            attributes: ['id', 'name']
        }]
    });

    res.json(watchlist);
}
export async function removeFromWatchList(req, res) {
    await WatchList.destroy({
        where: {
            userId: req.user.id,
            movieId: +req.params.movieId
        }
    });
    
    res.json({ message: 'Movie removed from watchlist' });
}