const { touristSpotSchema, reviewSchema } = require("./schemas");
const ExpressError = require("./utils/ExpressError");
const TouristSpot = require('./models/touristSpot');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash("error", "you must be signed in");
        return res.redirect("/login");
    }
    next();
}

module.exports.validateTouristSpot = (req, res, next) => {
    const { error } = touristSpotSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, rers, next) => {
    const { id } = req.params;
    const touristSpot = await TouristSpot.findById(id);
    if (!touristSpot.author.equals(req.user._id)) {
        req.flash("error", "You do not have permission to do that");
        return res.redirect(`/touristSpots/${id}`)
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isReviewAuthor = async (req, rers, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You do not have permission to do that");
        return res.redirect(`/touristSpots/${id}`)
    }
    next();
}