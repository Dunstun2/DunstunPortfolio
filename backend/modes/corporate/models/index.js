const sequelize = require('../../../config/database');
const Hero = require('./Hero');
const About = require('./About');
const Service = require('./Service');
const Project = require('./Project');
const Event = require('./Event');
const Referee = require('./Referee');
const Testimonial = require('./Testimonial');
const BlogPost = require('./BlogPost');
const ContactMessage = require('./ContactMessage');
const SocialAccount = require('./SocialAccount');
const ShowVideo = require('./ShowVideo');

const models = {
  Hero,
  About,
  Service,
  Project,
  Event,
  Referee,
  Testimonial,
  BlogPost,
  ContactMessage,
  SocialAccount,
  ShowVideo,
};

module.exports = { sequelize, ...models };
