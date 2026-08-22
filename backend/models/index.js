// Central models index exporting portfolio and corporate models
const portfolioModels = require('../modes/portfolio/models');
const corporateModels = require('../modes/corporate/models');

module.exports = {
  ...portfolioModels,
  ...corporateModels,
  portfolio: portfolioModels,
  corporate: corporateModels,
};
