const Telegraf = require("telegraf");
const fs = require("fs-extra");
const express = require("express");
const body = require("body-parser");
const app = express();
const utils = require("./lib/utils");
const bot = new Telegraf(utils.config.key);
const commands = require("./lib/commands");
const GmailNotifier = require("./lib/GmailNotifier");
const gmail = new GmailNotifier();

// gmail.init();

app.use(body.json({ limit: '500mb' }));
app.use(body.urlencoded({ limit: '500mb', extended: true, parameterLimit: 50000 }));

const Scraper = require("./lib/Scraper");
const scraper = new Scraper({
    username: utils.config.username,
    password: utils.config.password,
    timeout: 60
})

function main() {

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

scraper.on('expired', async () => {

    await scraper.reset();
    main();

})

scraper.on('first-time', data => {

    var message = "Ho trovato nuovi post su <b>" + data.title + "</b>\n\n"
    data.stuff.forEach(post => {

        message += `- <a href="${post.url}"> ${post.text} </a>\n`

    })

    bot.telegram.sendMessage(utils.config.group_id, message, { parse_mode: 'HTML' });

})

scraper.on('new-posts', data => {

    var message = "Ho trovato nuovi post su <b>" + data.title + "</b>\n\n"
    data.stuff.forEach(post => {

        message += `- <a href="${post.url}"> ${post.text} </a>\n`

    })

    bot.telegram.sendMessage(utils.config.group_id, message, { parse_mode: 'HTML' });

})

bot.on('new_chat_members', (ctx) => {

    let members = ctx.message.new_chat_members;

    members.forEach(member => {

        if (member.username)
            bot.telegram.sendMessage(utils.config.group_id, `ciaoooo @${member.username}, benvenuto su @unimoreinginfo\nAllora sostanzialmente le regole sono poche, cioè son tipo due, allora:\n1) <b>madonna se dici stonks mamma mia vergognati</b>\n2) <b>rispetta la gente </b>\n\nbene, ora divertiti e buona permanenza da parte mia, Botterino Balboni, aka il bot del gruppo.`, { parse_mode: 'HTML' })
        else
            bot.telegram.sendMessage(utils.config.group_id, `ciaoooo ${member.first_name}, benvenuto su @unimoreinginfo\nAllora sostanzialmente le regole sono poche, cioè son tipo due, allora:\n1) <b>madonna se dici stonks mamma mia vergognati</b>\n2) <b>rispetta la gente </b>\n\nbene, ora divertiti e buona permanenza da parte mia, Botterino Balboni, aka il bot del gruppo.`, { parse_mode: 'HTML' })

    })

})

bot.on('text', async (ctx) => {

    let message = ctx.message;

    if (message.text === undefined)
        message.text = "";

    if (message.text.toLowerCase().charAt(0) === '!') {

        const args = { bot, message, text: message.text.split(" ") }       

        let reply = await commands.execute(args.text[0].split("!")[1], args);

        if (!reply.hasOwnProperty("text"))
            return;
        if (reply.markup)
            ctx.reply(reply.text, { reply_markup: reply.markup, parse_mode: (reply.parse_mode || 'HTML') })
        else
            ctx.reply(reply.text, { parse_mode: (reply.parse_mode || 'HTML') })

    }


    if (message.text.toLowerCase().includes("stonks"))
        ctx.reply("se dici stonks ti dovresti vergognare del tuo patrimonio genetico")

})

gmail.on('new-message', message => {

    const mail = `
Nuova mail ricevuta\n
<b>Da: ${message.from.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</b>\n
<i>Oggetto: ${message.subject}</i>\n\n
${message.text}
`

    bot.telegram.sendMessage(utils.config.group_id, mail, { parse_mode: 'HTML' })
        .then(message => {

            bot.telegram.pinChatMessage(message.chat.id, message.message_id)

        })

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
    bot.telegram.sendMessage(utils.config.group_id, message, { parse_mode: 'HTML' })

    res.json(true);

})

app.post('/courses', (req, res) => {

    console.log(JSON.stringify(req.body));


    res.json(JSON.stringify(req.body));

})

/*setInterval(() => {

    funzione tolta perché cagava il cazzo

  let currentDate = new Date(),
      hours = currentDate.getHours(),
      minutes = currentDate.getMinutes(),
      seconds = currentDate.getSeconds();

  if(hours == 16 && minutes == 50 && seconds == 0){

    utils.config = JSON.parse(fs.readFileSync("config.json"));
    
    let songs = utils.config.bangers;

    if(songs.length == utils.config.indexes.length)
      utils.config.indexes = [];

    let random = Math.round(Math.random() * (songs.length - 1));
    let a = utils.config.indexes.filter(index => {return index == random});

    while(a.length > 0){

      random = Math.round(Math.random() * (songs.length - 1));
      a = utils.config.indexes.filter(index => {return index == random});

    }

    utils.config.indexes.push(random);
    fs.outputJson("config.json", utils.config)
      .then(success => {

        bot.telegram.sendMessage(utils.config.group_id, `<b>La canzone di oggi è</b>: ${utils.config.bangers[random]}\nOgni giorno alle 16:50 vi delizierò con la musica`, {parse_mode: 'HTML'});

      }).catch(err => {

        throw err;

      })

  }


}, 1000);*/

app.listen(1515) // webhook
bot.launch();
