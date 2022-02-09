# RESTful-Typescript-Koa

👷🏿 by [Emmanuel N K](https://www.github.com/emmanuelnk) 

![restful-typescript-koa-banner](https://user-images.githubusercontent.com/19330930/99025165-296f7780-25a3-11eb-8c38-e17cca2725df.jpg)

[![Actions Status](https://github.com/emmanuelnk/restful-typescript-koa/workflows/build/badge.svg)](https://github.com/emmanuelnk/restful-typescript-koa/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/dwyl/esta/issues)
[![Twitter](https://img.shields.io/twitter/follow/emmanuel_n_k?style=social)](https://twitter.com/emmanuel_n_k)



## Introduction

This project is a simple RESTful API Template built using NodeJS, KOA, Typescript and TypeORM as an ORM for MongoDB. Middleware uses JWT, CORS, Winston Logger. Swagger API docs are used to produce an api front-end.  

Check out the project homepage here: [restful-typescript-koa](https://restful-typescript-koa.herokuapp.com)   
Or get straight to the action in an online API GUI here (courtesy of Swagger UI): [restful-typescript-koa/swagger-html](https://restful-typescript-koa.herokuapp.com/swagger-html)    
Or view the project github here: [restful-typescript-koa](https://github.com/emmanuelnk/restful-typescript-koa)   

### What it has
- Node.js (v14.x.x)
- NPM (v6.x.x) 
- Typescript
- KOA Framework v2
- MongoDB 4 with TypeORM
- Redis (Invalidating Authentication Tokens | Optional)
- Winston (logging)
- Swagger-UI (documenting the API)
- Mocha, Chai, Supertest (unit and integration tests)
- AJV for Schema validation

### Available endpoints in this template
- This is just a template to be used as a starter to develop more robust APIs
- Keeps things simple by only handling authentication and CRUD operations for a user in the most RESTful way possible
- Versioning is not opinionated in this project. Apply it as you see fit.
- Available routes in this template are:
- `GET /` - index route
- `POST /login` - login (returns the access token to access protected routes)
- `GET /refresh` - a route to get a new jwt access token when the old one expires
- `GET /logout` - revoke access token (and optionally add it to redis blacklist)
- `GET /users` - get all users
- `POST /users` - create a new user
- `GET /users/:id` - fetch a user
- `PUT /users/:id` - update a user
- `DELETE /users/:id` - delete a user
- From these you can use the structure to build out other routes, controllers, services and entities.

## Setup

### Requirements
- Node.js version >= 12
- npm version >= 6
- docker and docker-compose (to run the mongodb db in localhost)

### Setup
- install dependencies:
  ```bash
  npm install
  ```
- OPTIONAL: setup the `.env` file. Edit the environment variables inside accordingly:
  ```bash
  cp .env.example .env
  ```
- OPTIONAL: start the mongodb container in docker:
  ```bash
  sudo docker-compose -f mongo.docker-compose up -d
  ```

- OPTIONAL: start the redis container in docker:
  ```bash
  sudo docker-compose -f redis.docker-compose up -d
  ```
### Start

- for development:
  ```bash
  npm run watch-server
  ```
- for deployment on local host:
  ```bash
  npm run build
  npm start
  ```
### Test
- to run all tests:
  ```bash
  npm test
  ```
- to run one test:
  ```bash
  npm run test-one path/to/file.spec.ts
  ```
### Coverage
- to run code coverage:
  ```bash
  npm run coverage
  ```

### Build and Deployment
- Project is built into a docker container and dpeloyed on Heroku
- Project is deployed via Github Actions to Heroku Free Tier using a `ci.yml` file in the project
- The example site uses Mongo Atlas Free Tier and Heroku Redis Free Tier add-on

## Design

### Project File Structure
- The project is written in Typescript. After Typescript compiles, all subsequently built javascript files are in `/dist`
- The entry point for the server is `src/server.ts`
- Program flow: `server` --> `routes` --> `controllers` --> `cervices` --> `entities`
- `Entities` are defined with and validated by TypeORM
- Custom Middlewares are in the `src/middleware` folder
- Database connection functions are in `src/providers/connections`
- Schemas for modelling and validation are in `src/schemas`
- Functions used in other parts of the program are in `src/libraries`
- Custom Interfaces for Typescript Types are in `src/interfaces` 
- Tests are in the `test` folder

### API Design
This project follows scalable project structure and RESTful best practices.

- The `routes` call controllers.
- The `controllers` choose what `services` to execute. No business logic goes in the `controllers`.
- The `services` handle the business logic as well as database layer access via `entities`.
- `entites` contain the entity models for database access
  
### Rate Limiting
- Rate limiting is implemented using koa middleware that keeps track of access in either an in-memory cache or redis datastore. 
- Redis would be the preferred albeit expensive option for this scenario.

### Testing
- This project concentrates on API integration tests and those are acheived using Mocha as a test runner, Chai for assertions and Supertest for accessing the server and making requests.
- Tests are run against test databases on local and a test database docker container when in CI (Github Actions)

### Authentication/Authorization
- Authentication is implemented using a jwt access and refresh token system. When a user logs in they are given a short term access token with which to perform authenticated requests. When this token expires they can access the `/refresh` endpoint to get another one. The refresh token is stored in the database. 
- The refresh token should expire after a very long time and thus allow the user to maintain a sliding session until the refresh token expires or the refresh token is invalidated.
- This method can allow for multiple device login for an api.
- A drawback of this method is with explicit log out. When a user logs outs, the client deletes the old token but the token is still valid on the server side.
- The solution to this is to enable the redis based token blacklist. Using the environment variable `REDIS_BLACKLIST_ENABLED` you can turn it on and off. You will need to set up the redis cluster before running any commands or revoking tokens.

### Versioning
- If you want to version this API, then I would advise placing `controllers`, `services` and `routes` into a folder named `v1`. Those are the most likely to change between versions. 
- You then change the related files accordingly.

## Contributing
- All contributions are welcomes
- Open up an issue if you encounter any problems. Thanks




  



