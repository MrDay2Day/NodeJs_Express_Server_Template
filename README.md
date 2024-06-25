<div align="center">
  <div>&nbsp;</div>
    <img src="secure/logo.png" width="600"/>
  <div>&nbsp;</div>
</div>

<div style="display: flex; justify-content: center;" >
<div style="max-width: 700px;" >

# Day2Day Group Technologies

## NodeJS WebServer Template

This is a work-in-progress `Typescript` `Express` `REST` Server with integrated `WebSocket` which can be used for messaging and server scale distribution. This template is design to operate at scale with it be distributed in node or separate instances.

This template has built-in file management using `S3` _(Simple Storage Service)_ protocol and an emailing engine that can send raw `html` emails with **attachments**.

### Services

- Backblaze
- AWS SES
- ClickSend

### Databases

- MongoDB
- MySQL
- PostGreSQL
- Redis (Used for Pub/Sub can be replaced with KeyDB)

### Technologies

- ExpressJS
- Multer
- Socket.IO
- Cors
- Compression

---

### **Key Features**

1. Self generating SQL databases and tables.
1. Scalability through redis 7 websocket.
1. Using multiple database concurrently.

---

## Setup

Copy and paste ".env.template" to ".env"

    cp .env.template .env

Then edit the `.env` file with the necessary credentials.

You are able to use multiple databases in this template whether individually or all at once `PostGres`, `MySQL` and `MongoDB`.

You are able to auto create Database and Tables/Collections on the fly when server starts up.

To start **server** in development mode:

    npm i

Then

    npm run dev

This will start the typescript compiler and also Nodemon

## Feature & Technologies List

These are features & technologies that may or may not be integrated in the future.

**Stages 👇🏿**  
✅ Completed  
➡️ In Progress  
✏️ Planning  
💭 Considering  
⚠️ Issue  
❌ Cancelled

**Current List**

- ✅ MySQL Integration
- ✅ PostGrSQL Integration
- ✅ MongoDB Integration
- ✅ Redis (Pub/Sub) Integration
- ✅ Multer Integration
- ✅ Socket.IO Integration
- ➡️ tRCP
- 💭 GraphQL
- ✏️ Paddle Integration
- ✏️ Stripe Integration
- ✏️ Paypal Integration
- ✏️ Stripe Integration
- 💭 HandlebarJS (For specified routes)
