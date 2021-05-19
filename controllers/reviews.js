const TouristSpot = require('../models/touristSpot');
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
    const touristSpot = await TouristSpot.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    touristSpot.reviews.push(review);
    await review.save();
    await touristSpot.save();
    req.flash("success", "Created new review!");
    res.redirect(`/touristSpots/${touristSpot._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await TouristSpot.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted review");
    res.redirect(`/touristSpots/${id}`)
}