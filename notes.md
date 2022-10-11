## how it works

receive calls for the APIs -> Hermes request third-party API -> the response gets sent to Athena

article to follow:
https://dev.to/mmcshinsky/a-simple-approach-to-managing-api-calls-1lo6

Goal: avoid hard coding our API calls into our components directly

Services folder:

- **provider.js:** defines how axios or any api library should connect with the database and connect our response data back to any connected file or component

- **core.js:** defines the reusable class that makes use of our provider.js with options we can define per api endpoint collection. As a result of being a constructor function, we can extend it's functionality on individual API collections as needed while still keeping a consistent base for the majority of our code.

- **response.js:** middleware to handle response parsing, error handling, logging, etc...

