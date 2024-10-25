# URL Shortener

A simple and scalable URL shortener built with Golang, Fiber, and MongoDB. This application allows users to shorten URLs, track analytics, and manage their short links. It includes user registration, login, and token-based authentication.

## Features

- Shorten URLs: Generate custom or random short URLs.
- Expiration Dates: Set an expiration date for each URL (optional).
- Analytics: Track the number of clicks for each shortened URL.
- User Authentication: Register and log in users with JWT-based authentication.
- Cookie-based Sessions: Session management using secure cookies.
- MongoDB Integration: Store and retrieve short link information in MongoDB.

## Prerequisites

Before you begin, ensure you have the following installed:

- Golang (version 1.17 or later)
- MongoDB (or a MongoDB Atlas account)
- Git
- .env file
