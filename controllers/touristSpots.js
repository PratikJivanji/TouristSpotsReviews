const TouristSpot = require('../models/touristSpot');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding")
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
    const touristSpots = await TouristSpot.find({});
    res.render('touristSpots/index', { touristSpots })
}

module.exports.renderNewForm = (req, res) => {
    res.render('touristSpots/new');
}

module.exports.createTouristSpots = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.touristSpot.location,
        limit: 1
    }).send()
    const touristSpot = new TouristSpot(req.body.touristSpot);
    touristSpot.geometry = geoData.body.features[0].geometry;
    touristSpot.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    touristSpot.author = req.user._id;
    await touristSpot.save();
    req.flash("success", "Successfully made a new touristSpot!");
    res.redirect(`/touristSpots/${touristSpot._id}`)
}

module.exports.showTouristSpots = async (req, res) => {
    const touristSpot = await TouristSpot.findById(req.params.id).populate({ path: "reviews", populate: { path: "author" } }).populate("author");
    if (!touristSpot) {
        req.flash("error", "Cannot find that touristSpot!");
        return res.redirect("/touristSpots");
    }
    res.render('touristSpots/show', { touristSpot })
}

module.exports.renderEditForm = async (req, res) => {
    const touristSpot = await TouristSpot.findById(req.params.id);
    if (!touristSpot) {
        req.flash("error", "Cannot find that touristSpot!");
        return res.redirect("/touristSpots");
    }
    res.render('touristSpots/edit', { touristSpot })
}

module.exports.updateTouristSpots = async (req, res) => {
    const { id } = req.params;
    const touristSpot = await TouristSpot.findByIdAndUpdate(id, { ...req.body.touristSpot });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    touristSpot.images.push(...imgs);
    await touristSpot.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await touristSpot.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash("success", "Successfully updated touristSpot!");
    res.redirect(`/touristSpots/${touristSpot._id}`)
}

module.exports.deleteTouristSpots = async (req, res) => {
    const { id } = req.params;
    await TouristSpot.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted touristSpot");
    res.redirect('/touristSpots')
}