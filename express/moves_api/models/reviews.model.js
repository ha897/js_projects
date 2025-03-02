import { DataTypes } from "sequelize";
import sequelize from "../utils/db.js";

const Review = sequelize.define('reviews', {
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    text: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // علاقة واحد لكثير مع اليوسر
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    // علاقة واحد لكثير مع الفلم
    movieId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});
// انشانا الاعمدة الان نربطها بالجداول
// هذه الحركة تفيدنا عند استدعائ الموديول ريفيو يستدعا معها المستخدم والفلم مرة واحدة
// models يحوي كل النماذج بالمشروع
Review.associate = (models) => {
    // belongsTo ينتمي الى
    // العمود movieId ينتمي الى الجدول movie
    Review.belongsTo(models.Movie, {
        foreignKey: 'movieId',
        as: 'movie'
    });
    // العمود userId ينتمي الى الجدول user
    Review.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
    });
};
export {Review}