const fs     = require("fs-extra");
const config = JSON.parse(fs.readFileSync("config.json"));

module.exports = {

    config

}