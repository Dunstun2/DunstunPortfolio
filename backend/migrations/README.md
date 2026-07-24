# Database Migrations

This directory contains Sequelize migration files for managing database schema changes.

## Creating a New Migration

```bash
npx sequelize-cli migration:generate --name description-of-change
```

## Running Migrations

```bash
npm run migrate
```

## Undoing Last Migration

```bash
npm run migrate:undo
```

## Undoing All Migrations

```bash
npm run migrate:undo:all
```

## Migration Best Practices

1. **Never modify existing migrations** - Create new ones to make changes
2. **Always include both up and down methods** - Ensure migrations are reversible
3. **Test migrations on a copy of production data** before deploying
4. **Keep migrations small and focused** - One logical change per migration
5. **Document breaking changes** in the migration file

## Example Migration

```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('projects', 'new_field', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('projects', 'new_field');
  }
};
```

## Current Schema Status

Before running migrations for the first time, your database was created using `sequelize.sync()`. 
Moving forward, all schema changes should be made through migrations to ensure:
- Version control of database changes
- Rollback capability
- Consistent deployments across environments
