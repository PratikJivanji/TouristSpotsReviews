const express = require("express");
const router = express.Router();
const touristSpots = require("../controllers/touristSpots");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateTouristSpot } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

router.route("/")
    .get(catchAsync(touristSpots.index))
    .post(isLoggedIn, upload.array("image"), validateTouristSpot, catchAsync(touristSpots.createTouristSpots))

router.get('/new', isLoggedIn, touristSpots.renderNewForm)

router.route("/:id")
    .get(catchAsync(touristSpots.showTouristSpots))
    .put(isLoggedIn, isAuthor, upload.array("image"), validateTouristSpot, catchAsync(touristSpots.updateTouristSpots))
    .delete(isLoggedIn, isAuthor, catchAsync(touristSpots.deleteTouristSpots))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(touristSpots.renderEditForm))

module.exports = router;