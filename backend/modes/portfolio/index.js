/**
 * Backend Portfolio Mode Module
 * Complete standalone package containing all models, routes, and services for Personal Portfolio websites.
 */
const models = require('./models');
const routes = require('./routes');
const experienceService = require('../../services/experience.service');
const educationService = require('../../services/education.service');
const skillService = require('../../services/skill.service');
const achievementService = require('../../services/achievement.service');
const certificationService = require('../../services/certification.service');
const cvImportService = require('../../services/cvImport.service');
const heroService = require('../../services/hero.service');
const aboutService = require('../../services/about.service');
const projectService = require('../../services/project.service');
const refereeService = require('../../services/referee.service');

module.exports = {
  name: 'portfolio',
  models,
  routes,
  services: {
    hero: heroService,
    about: aboutService,
    project: projectService,
    experience: experienceService,
    education: educationService,
    skill: skillService,
    achievement: achievementService,
    certification: certificationService,
    referee: refereeService,
    cvImport: cvImportService,
  }
};
