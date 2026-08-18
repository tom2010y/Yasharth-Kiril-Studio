# Kiril Studio booking backend

Your current GitHub Pages form uses `window.location.href = "mailto:"...`, which hands the booking to the visitor's email client. This backend receives the form and sends the notification server-side instead.

## Deploy

Deploy the `backend` folder to a Node.js host such as Render, Railway, Fly.io, or a VPS.

Environment variables:
- `BOOKING_EMAIL`: mailbox receiving bookings
- `SMTP_HOST`: SMTP server
- `SMTP_PORT`: usually 587
- `SMTP_SECURE`: `false` for STARTTLS on 587
- `SMTP_USER`: SMTP username
- `SMTP_PASS`: SMTP password/app password
- `SMTP_FROM`: sender address
- `FRONTEND_ORIGIN`: `https://tom2010y.github.io`

Start:
`npm install && npm start`

API:
`POST /api/bookings`
`GET /health`

## Frontend

In `booking.html`, remove the old submit handler that builds `subject`, `body`, and calls `window.location.href = "mailto:"...`.

Use the supplied `frontend-submit.js` logic instead and set `BOOKING_API` to your deployed backend URL.

Never put SMTP credentials in GitHub Pages.
