// opensearch.js
const { Client } = require('@opensearch-project/opensearch');

const client = new Client({
  node: 'https://your-opensearch-endpoint', // e.g. https://search-my-domain-abc123.us-east-1.es.amazonaws.com
  auth: {
    username: 'admin', // If you're using fine-grained access control
    password: 'admin-password',
  },
  ssl: {
    rejectUnauthorized: false, // only if using self-signed certs
  }
});

module.exports = client;
