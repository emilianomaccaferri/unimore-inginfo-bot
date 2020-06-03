const ExamFecther = require("./ExamFetcher"),
    utils = require("./utils"),
    ef = new ExamFecther(utils.config);

const commands = [

    {

        name: "statistica",
        desc: "che voto hai preso in statistica?",
        exec: (args) => {

            args.text.shift();
            if(args.text.length < 2)
            return {
                text: `Sintassi errata.
La sintassi corretta è: 
<b>!statistica voto/18 voto/18</b>
Controlla, ovviamente, che il voto inserito sia minore o uguale a 18`
            }

            let vote_string = args.text.join(" ");
            const parse = /^(\d{1,2})\/18 (\d{1,2})\/18$/.exec(vote_string);

            if(!parse)
            return {
                text: `Sintassi errata.
La sintassi corretta è: 
<b>!statistica voto/18 voto/18</b>
Controlla, ovviamente, che il voto inserito sia minore o uguale a 18`
            }

            const first_vote = parseInt(parse[1]),
                second_vote = parseInt(parse[2]);

            if((first_vote > 18 || first_vote < 1) || (second_vote > 18 || second_vote < 1))
            return {
                text: `Sintassi errata.
La sintassi corretta è: 
<b>!statistica voto/18 voto/18</b>
Controlla, ovviamente, che il voto inserito sia minore o uguale a 18`
            }
            
            const result = [partial(first_vote), partial(second_vote)]
            if(!result[0] || !result[1])
            return {
                text: `Il punteggio che hai inserito non è ottenibile nella prova di statistica`
            }
            
            let final_vote = 0;

            result.forEach(item => {

                for(let i = 0; i < item.result.length; i++){

                    if(final_vote >= 24 && item.result[i] == 4)
                        continue;
                    
                    final_vote += item.result[i];

                }

            })
            
            return {
                text: `Il voto finale è: <b>${final_vote}</b>\n
In particolare hai sbagliato:
- <b>${result[0].wrong_ex}</b> esercizi(o) e <b>${result[0].wrong_th}</b> domanda/e di teoria nella prima parte
- <b>${result[1].wrong_ex}</b> esercizi(o) e <b>${result[1].wrong_th}</b> domanda/e di teoria nella seconda parte`
            }

        }

    },

    {
        name: "videolezioni",
        desc: "link alla raccolta delle videolezioni",
        exec: async () => {

            return {

                text: `Ecco qua tutte le videolezioni fatte finora: <a href="https://uni.emilianomaccaferri.com/videolezioni">clicca qui</a>`

            }

        }
    },

    {

        name: "dimostrazioni",
        desc: "elenco di tutte le dimostrazioni da fare per le materie del corso",
        exec: async () => {

            let message = `Ecco la lista delle dimostrazioni disponibili:\n`;

            utils.config.proofs.forEach(proof => {

                message += `- <a href="${proof.url}">${proof.name}</a>\n`

            })

            return {
                text: message
            }

        }

    },

    {

        name: "cringe",
        desc: "mostra el faciun del cringe",
        exec: async (args) => {

            args.bot.telegram.sendMessage(utils.config.group_id, 'https://static.emilianomaccaferri.com/faccia_del_cringe.jpg');
            return {};

        }

    },

    {
        name: "help",
        desc: "mostra la lista di comandi disponibili",
        exec: () => {

            let rep = `Ecco una lista di comandi disponibili:\n`

            commands
                .forEach(item => {

                    rep += `- !<b>${item.name}</b>: ${item.desc}\n`

                })

            return { text: rep };

        }
    },

    {
        name: "soluzioni",
        desc: "elenca tutti i link per le soluzioni agli esami (fatte finora)",
        exec: () => {

            return {
                text: `Ecco le soluzioni alle tracce d'esame pubblicate:\n
- <a href="https://github.com/unimoreinginfo/esami-fdi-1">Fondamenti di Informatica I</a>`}

        }
    },

    {

        name: "esami",
        desc: "elenca tutti gli esami disponibili per Ingegneria Informatica",
        exec: async (args) => {

            try {

                let exams = await ef.getExams(),
                    message = ``;

                if (args.text.length == 1) {

                    message += `Esami disponibili:\n`;

                    Object.keys(exams)
                        .forEach(item => {

                            message += `- <b>${item}</b>\n`

                        })

                    return { text: message };

                } else {

                    let keywords = args.text.slice(1); // command is in args
                    // building an AND regex 
                    // all the keywords must appear in the subject name
                    // it works well actually and it's pretty fast 
                    keywords = keywords
                        .map(kw => {
                            return kw = `(?=.*${kw.toLowerCase()})`
                        })

                    let regex = new RegExp(keywords.join(""));

                    let replies = [];

                    Object.keys(exams)
                        .forEach(item => {

                            if (regex.test(item.toLowerCase()))
                                replies.push({ name: item, results: exams[item] });

                        })

                    if (replies.length == 0)
                        return { text: 'Non ho trovato alcun esame per questa materia' }

                    let message = "";

                    replies.forEach((reply, t) => {

                        message += `- <b>${reply.name}</b>\n<b>Insegnante/i</b>: ${reply.results[0].teacher}\n\n`

                        reply
                            .results
                            .forEach(result => {

                                message += `<b>${result.date}</b>\nTipo d'esame: ${result.type}\nFinestra di iscrizione: ${result.available}\nNumero iscritti: ${result.part}\n`
                                message += '\n\n'

                            })

                        message += '\n'

                    })

                    return { text: message }

                }

            } catch (err) {

                console.log(err);

                return { text: `Errore durante l'ottenimento della lista degli esami... uhm` }

            }

        }

    },

    {

        name: "about",
        desc: "un po' di cose su di me",
        exec: () => {

            return {

                text: `<b>Bot "ufficiale" del gruppo di Ingegneria Informatica @ Unimore</b>\n- <a href="https://github.com/emilianomaccaferri/unimore-inginfo-bot">Codice sorgente</a>\n\nSviluppato e mantenuto da Emiliano Maccaferri.\n\n<i>Questo bot raccoglie messaggi per motivi riguardanti l'analisi del linguaggio naturale, però non ti preoccupare, tutti i tuoi dati e i tuoi messaggi sono al sicuro (non è vero, non lo fa ancora perché non ho tempo di fare una minchia)!</i>\nCiao!`

            }

        }
    }

]


module.exports.execute = async (cmd, args) => {

    let command = null;
    commands
        .some((item, i) => {

            if (item.name === cmd)
                command = commands[i];

        })

    /*if (args.message.chat.id != utils.config.group_id)
        return { text: "Questo bot è utilizzabile solo dentro @unimoreinginfo" };*/

    if (command)
        return await command.exec(args);
    else return { text: "Comando non trovato... Scrivi <b>!help</b> per una lista di comandi" };


}

function partial(v){

    let sum = 0;
    let schema = [4, 4, 4, 4, 1, 1], result = [], wrong_ex = 0, wrong_th = 0;

   for(let i = 0; i < schema.length; i++){

        if(sum + schema[i] > v){
            if(i < 4) wrong_ex += 1;
            else wrong_th += 1;
            result.push(0);
            continue
        }
        else
            result.push(schema[i]);  
        
        sum += schema[i]

   }

   if(sum != v)
        return null;

   return {result, wrong_ex, wrong_th};

}