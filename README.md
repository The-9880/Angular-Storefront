# Angular-Storefront
My final project for Web Technologies - a simple storefront with user accounts that have different privilege levels and controls.
Purchases are simulated, stock is updated accordingly (and in real-time), and receipts are shown on transaction completion.
Users can review items.
Store Manager accounts have full controls over stock, items for sale, and can manage other accounts (including activating and locking them)

The Angular frontend application is supported by a web API written in Node. Both servers run on the same host with a proxy script in between.

I had to create a new public repo for this because of reasons. Note that the MongoDB url and email setup have been redacted, so the application won't be fully functional as it is in this repo.

Tech:
- Angular frontend
- JWT sessions and authentication
- Supported by a MongoDB document database, Mongoose-defined schemas
- email activation required for new users
- Bcrypt password encryption

## Node Dependencies
- Bcrypt
- Mongoose/MongoDB
- Express
- JWT
- Validator
- Mailer
- BodyParser
