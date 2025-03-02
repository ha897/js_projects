import { Movie } from "../models/index.js";

export async function getMovies(req,res){
    const movies = await Movie.findAll()
    res.json(movies)
}
export async function getMovie(req,res){
    const movie = await Movie.findByPk(req.params.id)
    res.json(movie)
}
export async function createMovies(req,res){
    const movie = await Movie.create({
        name:req.body.name,
        genre:req.body.genre,
        releaseDate:req.body.releaseDate
    })
    res.status(201).json(movie)
}

export async function updateMovie(req, res) {
    const movie = await Movie.findByPk(req.params.id);
    if (!movie) {
        return res.status(404).json({ message: 'Movie not found' });
    }
    movie.name = req.body.name;
    movie.genre = req.body.genre;
    movie.releaseDate = req.body.releaseDate;

    await movie.save();

    return res.json(movie);
}
export async function deleteMovie(req, res) {
    const movie = await Movie.findByPk(req.params.id);
  
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
  
    await movie.destroy();
  
    res.json({ message: 'Movie deleted' });
  }
  