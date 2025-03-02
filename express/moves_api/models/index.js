import { User } from "./users.model.js"
import { Movie } from "./movies.model.js"
import { Review } from "./reviews.model.js"
import { WatchList } from "./watchlist.model.js"
const models = {
    User,
    Movie,
    Review,
    WatchList
}
// الربط على مستوى سكوليز
Object.keys(models).forEach((modelName) => {
    // التاكد من ان النموزج يجوي associate هي توجد بالنمازج التي تربط مع بعضها
    // اذا كانت موجودة استخدمها للربط
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});
export { User, Movie, Review, WatchList }