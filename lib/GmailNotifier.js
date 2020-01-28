const { google } = require('googleapis');
const EventEmitter = require('events').EventEmitter;

class GmailNotifier extends EventEmitter{

    constructor(data){

        this.auth;
        
        this._authorize(JSON.parse(data))
            .then(auth => {

                this.auth = auth;

            })

    }

    _authorize(credentials){

        return new Promise(
    
          (resolve, reject) => {
    
            const {client_secret, client_id, redirect_uris} = credentials.installed;
            const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    
            fs.readFile('token.json')
              .then(token => {
    
                oAuth2Client.setCredentials(JSON.parse(token));
    
                resolve(oAuth2Client);
    
              })
    
            .catch(err => {
    
              throw err;
    
            })
    
    
          }
    
        )
    
    }

}

module.exports = GmailNotifier;