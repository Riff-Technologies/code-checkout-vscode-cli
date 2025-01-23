Create an account using Cognito - this will also trigger the creation of a publisher and add it as a property on the cognito record, and add a publisherId claim to the JWT. The username will be an email address, and the user will be required to enter their `publisher`. By default the `publisher` should be the `publisher` field from their `package.json` file. Optionally a user can also provide a `company` to associate with their account. After creating the account the user will be required to enter the confirmation code from an email they receive from cognito. The publisherId and JWT will be used to make requests to my server. The endpoint for creating the user is:
`POST {{baseUrl}}/users
body: {
    "username": "myemail@example.com",
    "email": "myemail@example.com",
    "password": "Test123!@#",
    "givenName": "John",
    "familyName": "Doe",
    "company": "My Company",
    "publisher": "my-company"
}`

The endpoint for confirming their account with a code is:
`POST {{baseUrl}}/users/confirm
body: {
  "username": "myemail@example.com",
  "confirmationCode": "152160"
}`

Link a stripe account with my platform stripe account. Call my endpoint to get a URL to link a stripe account, and open that URL in the user’s default browser.

Create a software record by calling my software endpoint and using data from the project’s package.json file: publisher, name, version. The response will include the ‘id’ which is the softwareId, which will be used for further requests. The endpoint is:
`POST {{baseUrl}}/publishers/:publisherId/software
body: {
  "name": "{{name}}",
  "version": "{{version}}",
  "metadata": {
    "category": "Development Tools",
    "platform": "Cross-platform"
  },
  "extensionId": "{{publisher}}.{{name}}"
}`

Create pricing for the software by making a request to my pricing endpoint. First we need to ask the user for the price type: monthly subscription or one-time purchase. Next we need to ask for the price from a list of options: $2.99, 4.99, 9.99, or custom. But the custom price should be clamped to not allow below 2.99 and not more than 99.99. Then it should call the endpoint to create the price. The endpoint is:
`POST {{baseUrl}}/publishers/:publisherId/software/:softwareId/pricing 
body: {
  "model": "subscription",  // or one-time or subscription
  "price": 5.99,
  "currency": "USD",
  "billingCycle": "month" // omitted if one-time
}`

Finally it should run a bash script that I have in my package to add some functionality to their code. The command to run the script is: `npx code-checkout-init`

It should store some information in a .code-checkout file in the user’s project root, such as publisherId, softwareId, and whatever else will make sense to access in the future.

The user should be able to log back into my service via the CLI to make updates to their software and pricing.

The user should be given a description of what is happening before each step so they know what’s going on.

Any errors should be shown with a good description.

Include environment variables in the CLI to help with configuration.

The CLI should be built in such a way that it also allows other options in the future, such as logging out, disconnecting their account, removing software and pricing models, etc. It will also be expanded upon in the future to add more pricing models and a free trial option, so it should be architected in such a way that makes it easy to expand its functions.
