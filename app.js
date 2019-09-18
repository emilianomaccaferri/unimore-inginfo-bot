const nodeogram = require("nodeogram");
const fs = require("fs");
const config = JSON.parse(fs.readFileSync("config.json"));
const bot = new nodeogram.Bot(config.key);
bot.init();

const Scraper = require("./lib/Scraper");
const scraper = new Scraper({
  username: config.username,
  password: config.password,
  timeout: 5
})

function main(){

  scraper.auth()
    .then(() => {

      console.log("logged in!");
      return scraper.fetchCourses()

    })

    .then(success => {

      return scraper.poll();

    })

    .then(done => {

      console.log("began polling for data");

    })

    .catch(err => {

      console.log(err);

    })

}

main();

scraper.on('expired', () => {

  console.log("asdas");
  main();

})

scraper.on('first-time', data => {

  // invia la roba per la prima volta
  console.log("CEEEE");

  var message = "Ho trovato nuovi post su <b>" + data.title + "</b>\n\n"
  data.stuff.forEach(post => {

    message += `- <a href="${post.url}"> ${post.text} </a>\n`

  })

  bot.sendMessage("-1001389867213", message, {parse_mode: 'HTML'});

  // -1001389867213

})

scraper.on('new-posts', data => {

  var message = "Ho trovato nuovi post su <b>" + data.title + "</b>\n\n"
  data.stuff.forEach(post => {

    message += `- <a href="${post.url}"> ${post.text} </a>\n`

  })

  bot.sendMessage("-1001389867213", message, {parse_mode: 'HTML'});

})
