# Zillow-style Property Listing API

## This API supports property CRUD operations, advanced search filtering, user authentication, and more.

#### 1. Property Listing: Create, Read, Update, Delete (CRUD)
#### 2. Search properties with filters: location, price range, number of bedrooms
#### 3. User authentication using email/password with JWT-based authorization
#### 4. Data persistence using MongoDB
#### 5. Pagination support on listing endpoints for scalable data retrieval
#### 6. Clear API versioning to support backward compatibility
#### 7. Redis caching for improved search query performance
#### 8. Robust data validation
#### 9. Role-Based Access Control (RBAC) for admin/user permissions


## Tech Stack

#### 1. Node.js with Express.js
#### 2. Mongoose (for MongoDB) as ORM
#### 3. Redis for caching
#### 4. Docker and Docker Compose for containerization

## Installation & Setup

```bash
# Clone the repo
git clone https://github.com/zsanjay/zillow-style-property-listing-api.git
cd zillow-style-property-listing-api

# Run the docker command
docker-compose up --build
```

## Postman Collection Link

#### https://github.com/zsanjay/zillow-style-property-listing-api/blob/main/postman_collection/Zillow%20Property%20Listing%20APIs.postman_collection.json
