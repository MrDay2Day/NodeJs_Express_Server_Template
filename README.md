<div align="center">
  <div>&nbsp;</div>
    <img src="secure/logo.png" width="600"/>
  <div>&nbsp;</div>
</div>

<div style="display: flex; justify-content: center;" >
<div style="max-width: 700px;" >

# [Day2Day Group Technologies](https://day2dayja.com)

Created by: _[MrDay2Day](https://github.com/MrDay2Day)_

## What is **Repo** this?

**Short answer:** A Boilerplate NodeJS Express Server Template written in Typescript built for scale!

**A little more explanation:** This is a _work-in-progress_ **boilerplate** `Typescript` written `Express` `REST` Server with integrated `WebSocket` & `Redis`. This _template_ is design to operate at scale using `Redis` and easily be deployed as a node cluster or/and on separate machines.

This template has built-in file management using `S3` _(Simple Storage Service)_ protocol and an emailing engine that can send raw `html` emails with **attachments**.

_There is also a unique authorization method which I personally use which tags all machines with a unique cookies that make a request to server so you are able to have some sense of the devices used by your users and is also very helpful when it comes to security and usage patterns._

**These are all custom solution and are at no point in time a RULE that should be followed, you are welcome to clone and edit a distribute as you see fit with any changes or no changes.**

## What did I build **Repo**?

Simple I am a **developer** who creates a lot of _servers_ and I often find myself _copying_ and _pasting_ from previous projects the same code. So I said to myself why not just create a _general template_ that has all the things I used most in my favorite worse language `Javascript` with a bit of seasoning being `Typescript`.

So I've integrated a lot of 3rd party packages and services which I know a lot of people will love and also so honorary mentions from my favorites' list.

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

Copy and paste `.env.template` to `.env`

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
- ⚠️ tRCP
- 💭 GraphQL
- ✏️ Paddle Integration
- ✏️ Stripe Integration
- ✏️ Paypal Integration
- ✏️ Stripe Integration
- 💭 HandlebarJS (For specified routes)
- 💭 Google Auth (With Recommendations and Procedures)
- 💭 Facebook Auth (With Recommendations and Procedures)
