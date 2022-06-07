const express = require('express');
const router = express.Router({ mergeParams: true });
const funCatch = require('../utils/funCatch');
const { isLoggedIn, validateForm, isAuthor, findCamp } = require('../middleware')
const campground = require('../controllers/launchLocations')
const AppError = require('../utils/AppError');
const multer = require('multer')
const { storage } = require('../cloudinary/index')
const upload = multer({ storage })


router.route('/')
    .get(funCatch(campground.index))
    .post(isLoggedIn, upload.array('image'), validateForm, funCatch(campground.createNew))
router.get('/new', isLoggedIn, campground.newCampForm);

router.route('/:id/')
    .get(findCamp, funCatch(campground.showCamp))
    .patch(isLoggedIn, isAuthor, upload.array('image'), validateForm, funCatch(campground.editCampSubmit))
    .delete(isLoggedIn, isAuthor, funCatch(campground.delete));

router.get('/:id/edit', findCamp, isLoggedIn, isAuthor, funCatch(campground.editCamp));



module.exports = router;