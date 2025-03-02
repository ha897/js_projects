import { DataTypes } from "sequelize";
import sequelize from "../utils/db.js";

const Movie = sequelize.define('movies', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    genre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    releaseDate: {
        type: DataTypes.STRING,
        allowNull: false,
    }
});
Movie.associate = (models) => {
    Movie.hasMany(models.Review, {
        foreignKey: "movieId",
        as: "reviews"
    })
    Movie.hasMany(models.Review, {
        foreignKey: "userId",
        as: "watchlists"
    })
}
export { Movie }