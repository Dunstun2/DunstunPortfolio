/**
 * Backend Corporate Mode Module
 * Complete standalone package containing all models, routes, and services for Corporate Business websites.
 */
const models = require('./models');
const routes = require('./routes');
const corporateHeroService = require('./services/hero.service');
const serviceService = require('./services/service.service');
const eventService = require('./services/event.service');
const projectService = require('./services/project.service');
const refereeService = require('./services/referee.service');

module.exports = {
  name: 'corporate',
  models,
  routes,
  services: {
    hero: corporateHeroService,
    service: serviceService,
    project: projectService,
    event: eventService,
    referee: refereeService,
  }
};
