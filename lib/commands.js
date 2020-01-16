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

            return rep;

        }
    },
    
    {
        name: "soluzioni",
        desc: "Elenca tutti i link per le soluzioni agli esami (fatte finora)",
        exec: () => {

            return `Ecco le soluzioni alle tracce d'esame pubblicate:\n
- <a href="https://github.com/unimoreinginfo/esami-fdi-1">Fondamenti di Informatica I</a>`

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
        return await command.exec();
    else return "Comando non trovato... Scrivi <b>!help</b> per una lista di comandi";
    

}