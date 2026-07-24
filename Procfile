# Heroku Procfile
# Defines process types and entry points for Heroku deployment

web: cd backend && npm start
release: cd backend && npx sequelize-cli db:migrate
