Onboarding Service

Description
User Service is a microservice built with **NestJS** that handles core user-related operations. It provides secure and scalable endpoints for SSO login, authentication token validation, game level updates, and user session exit. The service is designed to work within a microservices architecture and integrates with RabbitMQ and Redis for messaging and caching.

Version
Current version: 0.0.1

Installation
$ npm install


Running the app

# development
$ npm run start

# watch mode
$ npm run start:dev

# debug mode
$ npm run start:debug

# staging environment
$ npm run start:stage

# production mode
$ npm run start:prod

Test
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov

## Key Features

- Single Sign-On support for seamless authentication  
- JWT-based token verification  
- Update and track game progression  
- Redis caching  
- RabbitMQ integration for microservice communication  
- Secure API endpoints with passport strategies  
- Sequelize ORM for database management

---

## Core Dependencies

- NestJS Framework – Progressive Node.js framework for building efficient and scalable server-side applications  
- RabbitMQ – Message broker for microservice communication  
- Redis – In-memory data structure store for caching  
- Sequelize – Promise-based ORM for MySQL  
- Passport – Authentication middleware  
- JWT – JSON Web Tokens for stateless auth  

## Development Tools

- ESLint – Linting utility  
- Prettier – Code formatter  
- Jest – Testing framework 

