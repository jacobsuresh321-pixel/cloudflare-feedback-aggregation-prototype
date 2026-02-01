Feedback Aggregation & Analysis Prototype

This repository contains a prototype built for the Cloudflare Product Manager Intern assignment.

The tool demonstrates how user feedback can be collected, stored, and analyzed using Cloudflare’s Developer Platform to generate actionable product insights.


Live Demo

https://jolly-breeze-e9d5.jacobsuresh321.workers.dev


What This App Does

- Accepts user feedback through an API
- Stores feedback entries in a database
- Analyzes recent feedback using AI
- Returns themes, sentiment, and product recommendations

This prototype is designed to show how feedback can be transformed into actionable product insights for product teams.


How to Use the App

The app is used by sending HTTP requests to its endpoints (for example using a browser, Hoppscotch, or Postman).

You do not need to install anything locally.


API Endpoints

POST /feedback

Use this endpoint to submit feedback.

You send a JSON body containing the feedback message and its source.
The feedback is stored in the database.

Example request body:

{
  "source": "support",
  "message": "The setup is confusing for beginners."
}


GET /feedback

Returns a list of recent feedback entries that have been stored.

This allows you to review raw feedback data.


GET /analyze

Analyzes recent feedback using Workers AI and returns:

- An executive summary
- Top themes with counts
- Overall sentiment
- Actionable product recommendations

This endpoint demonstrates how feedback can be automatically summarized for product decision-making.


Cloudflare Products Used

- Cloudflare Workers for hosting the API and orchestration
- D1 Database for storing feedback
- Workers AI for feedback analysis


Notes

- Mock data is used
- No third-party integrations are required
- This is a prototype intended for demonstration purposes
