# Flight Management System

A NestJS-based flight booking and management system that allows users to search, book, and manage flight tickets.

## Features

- User Management
- Flight Search and Booking
- Seat Class Configuration
- Fare Management
- Booking Management
- Flight Status Updates

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- PostgreSQL

## Installation

1. Install dependencies:
```bash
npm install
```

## Run commands:
npm run start:dev

## API Structure
All API endpoints are centralized in the User Controller (`src/user/user.controller.ts`). The base path for all endpoints is `/user`.


## Database Setup

1. Install PostgreSQL:
   - Download and install PostgreSQL from (https://www.postgresql.org/download/)
   - Remember your PostgreSQL username and password during installation

all the DB creds are in .env file


2. Create Database:
```bash
psql -U postgres
CREATE DATABASE flight_management;


