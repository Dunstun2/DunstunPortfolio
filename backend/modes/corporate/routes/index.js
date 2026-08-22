const express = require('express');
const router = express.Router();

const corporateHeroRoutes = require('./corporateHero.routes');
const aboutRoutes = require('./about.routes');
const serviceRoutes = require('./service.routes');
const projectRoutes = require('./project.routes');
const eventRoutes = require('./event.routes');
const refereeRoutes = require('./referee.routes');
const testimonialRoutes = require('./testimonial.routes');
const blogRoutes = require('./blog.routes');
const contactRoutes = require('./contact.routes');
const showVideoRoutes = require('./showVideo.routes');

router.use('/hero', corporateHeroRoutes);
router.use('/about', aboutRoutes);
router.use('/services', serviceRoutes);
router.use('/projects', projectRoutes);
router.use('/events', eventRoutes);
router.use('/referees', refereeRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/blog', blogRoutes);
router.use('/contact', contactRoutes);
router.use('/show-videos', showVideoRoutes);

module.exports = router;
