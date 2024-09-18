# SurfNow 🌊🏄

Hey there fellow wave chaser. Welcome to **SurfNow**, the app that keeps you in the loop with the latest surf conditions so you never miss a good wave. 
Whether you're a seasoned surfer or just starting out, SurfNow has got your back. Let's dive in!

## What's This All About?

SurfNow is a Node.js app built with TypeScript and NestJS. It checks surf conditions at various beaches and notifies users when the waves are just right. No more guessing or missing out on those perfect surf days!

## Features

- **Real-time Surf Checks**: Get the latest surf conditions from multiple beaches.
- **Customizable Alerts**: Set your own criteria for wave height and get notified when conditions match.
- **Email & SMS Notifications**: Receive alerts via email and text message.
- **Opt-Out Option**: Don't want notifications? No problem, you can opt out anytime.

## Tech Stack

- **TypeScript**: Because type safety is cool.
- **NestJS**: A progressive Node.js framework for building efficient and scalable server-side applications.
- **npm**: For managing dependencies.
- **Beachcam API**: For fetching real-time surf conditions.

## Getting Started

### Prerequisites

Make sure you have Node.js and npm installed. If not, grab them [here](https://nodejs.org/).

### Installation

Clone the repo and install the dependencies:

```bash
git clone https://github.com/arnaldotema/surfnow.git
cd surfnow
npm install
```

### Configuration
Create a .env file in the root directory and add your configuration settings. Here's an example:
```bash
EMAIL_SERVICE_API_KEY=your-email-service-api-key
SMS_SERVICE_API_KEY=your-sms-service-api-key
```

Running the App
```bash
npm run start
```

### How It Works
1. Cron Jobs: The app uses cron jobs to check surf conditions every minute. 
2. Surf Checker: Fetches surf conditions from Beachcam. 
3. User Criteria: Checks if the conditions meet user-defined criteria. 
4. Notifications: Sends out email and SMS notifications to users.