const sequelize = require('../config/database');
const User = require('./User');
const Media = require('./Media');
const CTA = require('./CTA');
const SocialAccount = require('./SocialAccount');
const Category = require('./Category');
const Tag = require('./Tag');
const Hero = require('./Hero');
const NavigationItem = require('./NavigationItem');
const About = require('./About');
const Project = require('./Project');
const Experience = require('./Experience');
const Education = require('./Education');
const Skill = require('./Skill');
const Testimonial = require('./Testimonial');
const ContactMessage = require('./ContactMessage');
const Setting = require('./Setting');
const Service = require('./Service');
const Achievement = require('./Achievement');
const Certification = require('./Certification');
const CVImport = require('./CVImport');

const AboutIdentityCard = require('./AboutIdentityCard');
const AboutValue = require('./AboutValue');
const AboutExploration = require('./AboutExploration');
const AboutHighlight = require('./AboutHighlight');

const Event = require('./Event');
const BlogCategory = require('./BlogCategory');
const BlogTag = require('./BlogTag');
const BlogPost = require('./BlogPost');
const BlogComment = require('./BlogComment');
const AnalyticsEvent = require('./AnalyticsEvent');

// Centralize model exports
const models = {
  User,
  Media,
  CTA,
  SocialAccount,
  Category,
  Tag,
  Hero,
  NavigationItem,
  About,
  AboutIdentityCard,
  AboutValue,
  AboutExploration,
  AboutHighlight,
  Achievement,
  Certification,
  CVImport,
  Project,
  Experience,
  Education,
  Skill,
  Service,
  Testimonial,
  ContactMessage,
  Setting,
  Event,
  BlogCategory,
  BlogTag,
  BlogPost,
  BlogComment,
  AnalyticsEvent,
};

// Define relationships here if any (e.g. User.hasMany(Session))
About.hasMany(AboutIdentityCard, { foreignKey: 'about_id', as: 'identity_cards', onDelete: 'CASCADE' });
AboutIdentityCard.belongsTo(About, { foreignKey: 'about_id' });

About.hasMany(AboutValue, { foreignKey: 'about_id', as: 'values', onDelete: 'CASCADE' });
AboutValue.belongsTo(About, { foreignKey: 'about_id' });

About.hasMany(AboutExploration, { foreignKey: 'about_id', as: 'explorations', onDelete: 'CASCADE' });
AboutExploration.belongsTo(About, { foreignKey: 'about_id' });

About.hasMany(AboutHighlight, { foreignKey: 'about_id', as: 'highlights', onDelete: 'CASCADE' });
AboutHighlight.belongsTo(About, { foreignKey: 'about_id' });

BlogPost.hasMany(BlogComment, { foreignKey: 'post_id', as: 'comments', onDelete: 'CASCADE' });
BlogComment.belongsTo(BlogPost, { foreignKey: 'post_id', as: 'post' });

BlogComment.hasMany(BlogComment, { foreignKey: 'parent_id', as: 'replies', onDelete: 'CASCADE' });
BlogComment.belongsTo(BlogComment, { foreignKey: 'parent_id', as: 'parent' });

// CVImport relationships
CVImport.belongsTo(User, { foreignKey: 'imported_by', as: 'importer' });
User.hasMany(CVImport, { foreignKey: 'imported_by', as: 'cvImports' });

module.exports = { sequelize, ...models };
