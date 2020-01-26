const   ExamFecther  = require("./ExamFetcher"),
        utils        = require("./utils"),
        ef           = new ExamFecther(utils.config),
        nodeogram    = require('nodeogram');

const commands = [

    {
        name: "help",
        desc: "Mostra la lista di comandi disponibili", 
        exec: () => {

        let rep = `Ecco una lista di comandi disponibili:\n`

        commands
            .forEach(item => {

                rep += `- !<b>${item.name}</b>: ${item.desc}\n`

            })

            return {text: rep};

        }
    },
    
    {
        name: "soluzioni",
        desc: "Elenca tutti i link per le soluzioni agli esami (fatte finora)",
        exec: () => {

            return {text: `Ecco le soluzioni alle tracce d'esame pubblicate:\n
- <a href="https://github.com/unimoreinginfo/esami-fdi-1">Fondamenti di Informatica I</a>`}

        }
    },

    {

        name: "esami",
        desc: "Elenca tutti gli esami disponibili per Ingegneria Informatica",
        exec: async(args) => {

            try{
             
                let exams = await ef.getExams(),
                    message = ``;
                
                if(args.text.length == 1){

                    message += `Esami disponibili:\n`;
                    
                    Object.keys(exams)
                        .forEach(item => {
                            
                            message += `- <b>${item}</b>\n`

                        })

                    return {text: message};

                }else{

                    let keywords = args.text.slice(1); // command is in args
                    // building an AND regex 
                    // all the keywords must appear in the subject name
                    // it works well actually and it's pretty fast 
                    keywords = keywords
                        .map(kw => {
                           return kw = `(?=.*${kw})`
                        })
                    
                    let regex = new RegExp(keywords.join(""));

                    let replies = [];

                    Object.keys(exams)
                        .forEach(item => {

                            if(regex.test(item))
                                replies.push({name: item, results: exams[item]});

                        })

                    if(replies.length == 0)
                        return {text: 'Non ho trovato nessun esame per questa materia'}
                    
                    let message = "";
                    
                    replies.forEach((reply, t) => {

                        message += `- <b>${reply.name}</b>\n`

                        reply
                            .results
                            .forEach(result => {

                                message += `Finestra di iscrizione: ${result.available}\nData dell'esame: ${result.date}\nTipo d'esame: ${result.type}\nNumero iscritti: ${result.part}\n\n`
                                message += '==========\n\n'

                            })

                        message += '\n\n'

                    })

                    return {text: message}

                }

                // let kb = new nodeogram.Keyboard([], {one_time_keyboard: true});

                // kb.addButton(0, 0, "Panglerio", {text: "angle", callback_data: "anglerio"});
                // kb.toInline();
                
            }catch(err){

                console.log(err);
                
                return {text: `Errore durante l'ottenimento della lista degli esami... uhm`}

            }

        }

    }

]


module.exports.execute = async(cmd, args) => {

    let command = null;
    
    commands
        .some((item, i) => {
   
            if(item.name === cmd)
               command = commands[i];                  

        })

    if(command)
        return await command.exec(args);
    else return {text: "Comando non trovato... Scrivi <b>!help</b> per una lista di comandi"};
    

}