# Refactor `index.js` to Reduce Complexity

The static analysis report shows that `index.js` has high complexity and lint errors. This is common when a single entry-point file handles server configuration, database migrations, and all route logic in one place. 

To resolve this, we will refactor `index.js` by moving its responsibilities into separate, modular files.

## Proposed Changes

We will separate concerns by fully utilizing the `controllers` and `routes` architecture that has already been started, and extract the DB migration.

### Database Migration

#### [NEW] `db/migration.js`
- Extract the auto-migration SQL logic (the large `pool.query` block) from `index.js` into this dedicated file.
- Export a function `runMigration()` that `index.js` can call on startup.

### Controllers

#### [MODIFY] `controllers/user.controller.js`
- Add the missing `getAllUsersAdmin` method to handle the `GET /api/users/all` route.
- Add the missing `deleteUser` method to handle the `DELETE /api/users/:id` route.

### Routes

#### [MODIFY] `routes/user.route.js`
- Add the `router.get('/all', userController.getAllUsersAdmin);` route.
- Add the `router.delete('/:id', userController.deleteUser);` route.
- **Note**: Ensure `/all` is registered before `/:id` so it doesn't get shadowed by the ID param.

### Entry Point

#### [MODIFY] `index.js`
- Remove all route logic (the `app.get`, `app.post`, `app.put`, `app.patch`, `app.delete` blocks for `/api/users/*`).
- Remove the inline database migration code.
- Import and use the user routes: `const userRoutes = require('../../cygwin64/home/pibon/sciconnect/routes/user.route'); app.use('/api/users', userRoutes);` (actually `./routes/user.route`)
- Import and run the database migration.
- `index.js` will become much shorter, serving only as the main application bootstrap.

## Verification Plan

### Automated Tests
- Run `npm test` (or `npx jest`) to ensure `test/api.integration.test.js` passes without any modifications. This verifies the refactoring didn't break existing behavior.
- We will manually re-run `npx plato -r -d report -n index.js` if necessary to confirm complexity reduction.
