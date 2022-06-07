const express = require('express');
const router = express.Router({ mergeParams: true });
const funCatch = require('../utils/funCatch');
const { isLoggedIn, validateForm, isAuthor, findSite } = require('../middleware')
const launchsites = require('../controllers/launchLocations')
const AppError = require('../utils/AppError');
const multer = require('multer')
const { storage } = require('../cloudinary/index')
const upload = multer({ storage })


router.route('/')
    .get(funCatch(launchsites.index))
    .post(isLoggedIn, upload.array('image'), validateForm, funCatch(launchsites.createNew))
router.get('/new', isLoggedIn, launchsites.newLaunchForm);

router.route('/:id/')
    .get(findSite, funCatch(launchsites.showSite))
    .patch(isLoggedIn, isAuthor, upload.array('image'), validateForm, funCatch(launchsites.editSiteSubmit))
    .delete(isLoggedIn, isAuthor, funCatch(launchsites.delete));

router.get('/:id/edit', findSite, isLoggedIn, isAuthor, funCatch(launchsites.editSite));



module.exports = router;