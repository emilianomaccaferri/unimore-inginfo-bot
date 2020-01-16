const nodeogram = require("nodeogram");
const fs = require("fs-extra");
const express = require("express");
const body         = require("body-parser");
const app     = express();
const config = JSON.parse(fs.readFileSync("config.json"));
const bot = new nodeogram.Bot(config.key);
const commands = require("./lib/commands");
bot.init();

app.use(body.json({ limit: '500mb' }));
app.use(body.urlencoded({ limit: '500mb', extended: true, parameterLimit: 50000 }));

const Scraper = require("./lib/Scraper");
const scraper = new Scraper({
  username: config.username,
  password: config.password,
  timeout: 60
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

scraper.on('expired', async() => {

  await scraper.reset();
  main();

})

scraper.on('first-time', data => {

  var message = "Ho trovato nuovi post su <b>" + data.title + "</b>\n\n"
  data.stuff.forEach(post => {

    message += `- <a href="${post.url}"> ${post.text} </a>\n`

  })

  bot.sendMessage(config.group_id, message, {parse_mode: 'HTML'});

})

scraper.on('new-posts', data => {

  var message = "Ho trovato nuovi post su <b>" + data.title + "</b>\n\n"
  data.stuff.forEach(post => {

    message += `- <a href="${post.url}"> ${post.text} </a>\n`

  })

  bot.sendMessage(config.group_id, message, {parse_mode: 'HTML'});

})

bot.on('message', async(message) => {

  if(message.text === undefined)
    return;

  if(message.text.toLowerCase().charAt(0) === '!'){

    const args = message.text.split(" ");
    
    let reply = await commands.execute(message.text.split('!')[1], args);
    message.reply(reply, {parse_mode: 'HTML'})

  }


  if(message.text.toLowerCase().includes("stonks"))
    message.reply("se dici stonks ti dovresti vergognare del tuo patrimonio genetico")

})

app.post('/broadcast', (req, res) => {

  var author_name = req.body.author_name,
      url = req.body.url,
      title = req.body.title,
      subject_id = req.body.subject_id,
      subject_name = req.body.subject_name,
      message = `

Nuovi appunti: <a href="https://uni.emilianomaccaferri.com${url}">${title}</a>\n
Materia: <a href="https://uni.emilianomaccaferri.com/subjects/${subject_id}"> ${subject_name} </a>\n
Autore: ${author_name}


      `
  bot.sendMessage(config.group_id, message, {parse_mode: 'HTML'})

  res.json(true);

})

app.listen(1515) // webhook


String.prototype.startsWith = function(string){

  return string.toLowerCase() == this.split(" ")[0].toLowerCase();

}
