'use strict'
const axios = require('axios'),
      creds = require('../auth/creds'),
      queryString = require('querystring'),
      auth = '/auth/realms/Amplify/protocol/openid-connect/token'; // api authentication endpoint

axios.defaults.baseURL = 'https://my.amplify.com';
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

module.exports = async function newToken() {
  try {
    const res = await axios.post(auth, queryString.stringify({
      username: creds.user.username,
      password: creds.user.password,
      grant_type: 'password',
      client_id: 'aqua-app'
    }))
    return res.data.access_token
  } catch (err) {
    console.error(err)
  }
};
