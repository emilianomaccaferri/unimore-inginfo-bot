const fs = require("fs-extra");
const cheerio = require("cheerio");
const config = JSON.parse(fs.readFileSync("config.json"));
const Database = require('better-sqlite3');
const rp = require("request-promise");
const req = rp.defaults({
    jar: true
});

module.exports = {

    config,
    db: new Database(__dirname + '/../data/users.db'),
    checkStatus: () => {

        return new Promise(

            (resolve, reject) => {

                req.get({
                    url: 'https://aimagelab.ing.unimore.it/olj2/esami/'
                })
                    .then(success => {

                        console.log(success);

                        /*return req({
                            method: 'POST',
                            uri: 'https://idp.unimore.it/idp/profile/SAML2/Redirect/SSO?execution=e1s1',
                            form: {
                                j_username: this.username,
                                j_password: this.password,
                                _eventId_proceed: ''
                            },
                            transform: function (body) {
                                return cheerio.load(body);
                            }
                        })*/

                    })

                    /*.then(body => {

                        console.log(body);


                        /*const $ = body,
                            samlResponse = $('input[name^="SAMLResponse"]').val(),
                            relayState = $('input[name^="RelayState"]').val();

                        console.log(samlResponse, relayState);*/


                    //})

                    .catch(err => {

                        console.log(err);

                        reject(err);

                    })

            }

        )

    }

}