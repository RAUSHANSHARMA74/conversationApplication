# Conversation Application

Welcome to the Conversation Application! This is a chat application that allows users to connect, send friend requests, and have conversations with each other.

## Features

- User authentication using Google and GitHub accounts
- Send and receive friend requests
- Real-time chat functionality
- Online status indicator for friends
- User-friendly interface

## Technologies Used

- **Frontend:** React, Socket.IO
- **Backend:** Node.js, Express.js, MongoDB, Socket.IO

## Frontend

The frontend of the Conversation Application is built using React and utilizes the Socket.IO library for real-time communication. Here's an overview of the frontend structure and key components:

### Project Structure

- **src/components:** Contains reusable components used across different parts of the application.
- **src/pages:** Represents different pages/routes of the application, including authentication, chat, and user details.
- **src/styles:** Includes CSS and styling files for the application.

### Key Components

- **Login:** Handles user authentication using Google and GitHub accounts. Users can log in using their existing accounts.
- **ChatHome:** Displays the user's friend list, indicating their online/offline status. Users can click on a friend to initiate conversations.
- **Conversation:** Provides a real-time chat interface for users to exchange messages with their friends.


## Setup Instructions

To get the Conversation Application up and running on your local machine, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/RAUSHANSHARMA74/conversationApplication.git

2. Install frontend dependencies:

   ```bash
   cd frontend
   npm install
   npm start

3. Install backend dependencies:

   ```bash
   cd backend
   npm install
   npm run server

4. Set up environment variables:

   ```bash
   port = 2415
   mongodb = "mongodb+srv://Example:<password>@cluster0.dqcvoon.mongodb.net/<Your Database name>?retryWrites=true&w=majority"
   SECRET_KEY = "anythings"
   saltroud = 6
   GOOGLE_CLIENT_ID = "Create Google Client_Id"
   GOOGLE_CLIENT_SECRET = "Create Google Client_Secret"
   GITHUB_CLIENT_ID = "Create Github Client_id"
   GITHUB_CLIENT_SECRET = "Create Github Client_Secret"
   REDIRECT_URL = "http://localhost:2415"
   REDIRECT_FRONTEND = "http://localhost:3000/"
   
4. Open your browser and navigate to:

   ```bash
   http://localhost:3000/

