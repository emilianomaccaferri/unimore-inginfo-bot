const { google } = require('googleapis');
const fs = require('fs-extra');
const EventEmitter = require('events').EventEmitter;

class GmailNotifier extends EventEmitter{

    constructor(){

        super();
        
        this.gmail;
        this.latest_message;
        this.polling_timeout = 5000;

    }

    async init(){

      let self = this;
      let data = await fs.readFile('./credentials.json');
      let auth = await this._authorize(JSON.parse(data));
      this.gmail = google.gmail({ auth: auth, version: 'v1' });

      setInterval(() => {

        this.gmail.users.messages.list({

          userId: 'me'

        }, (err, result) => {

          if(err)
            return this.emit('error', err);

          let latestMessageId = result.data.messages[0].id;
          if(latestMessageId != this.latest_message){

            this.latest_message = latestMessageId;

            this.gmail.users.messages.get({
              'userId': 'me',
              'id': latestMessageId
            }, function (err, result) {

              let headers = result.data.payload.headers,
                  subject, from;
                
              headers
                .forEach(header => {

                  if(header.name === 'Subject')
                    subject = header.value;
                  
                  if(header.name === 'From')
                    from = header.value;
                  
              })
              
              let buf = result.data.payload.parts[0].parts;
              if(!buf)
                buf = result.data.payload.parts[0].body.data;
              else
                buf = result.data.payload.parts[0].parts[0].body.data // idk wtf is going on with gmail i have to figure this out
              
              let text = Buffer.from(buf, 'base64').toString('utf-8');

              self.emit('new-message', {

                subject, from, text
              
              })

            });

          }            

        })

      }, this.polling_timeout)


    }

    _authorize(credentials){

        return new Promise(
    
          (resolve, reject) => {
    
            const {client_secret, client_id, redirect_uris} = credentials.installed;
            const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    
            fs.readFile('./token.json')
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