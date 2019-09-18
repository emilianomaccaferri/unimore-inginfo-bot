const request = require("request-promise");
const cheerio = require("cheerio");
const req = request.defaults({
  jar: true
});

module.exports = {

  req

}
