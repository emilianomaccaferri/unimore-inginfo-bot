const EventEmitter = require('events');
const CourseFetcher = require("./CourseFetcher");
const cheerio = require("cheerio");
var req;

class Scraper extends EventEmitter{

  constructor(auth){

    super();
    this.username = auth.username;
    this.password = auth.password;
    this.authenticating = false;
    this.courses = [];
    this.polling_timeout = auth.timeout * 1000 || 180 * 1000;
    this.fetchers = [];
    this.stop = false;

  }

  poll(){

    this.stop = false;
    this.fetchers.forEach(fetcher => {

      fetcher.stop();
      this.fetchers.pop();

    })

    this.courses.forEach((course, i) => {

      var fetcher = new CourseFetcher(course, req, this.polling_timeout, i).init();
      this.fetchers.push(fetcher);

      fetcher.on('expired', data => {

        if(!this.stop){

          this.emit('expired');
          this.stop = true;

        }

      })

      fetcher.on('empty', data => {

        // console.log(`${data.title} è vuoto`);

      })

      fetcher.on('first-time', data => {

        this.emit('first-time', data)

      })

      fetcher.on('new-posts', data => {

        this.emit('new-posts', data);

      })

    })

  }

  fetchCourses(){

    return new Promise(

      (resolve, reject) => {

        req({
          method: 'GET',
          uri: 'https://dolly.ingmo.unimore.it/2019/course/index.php?categoryid=36',
          transform: function (body) {
              return cheerio.load(body);
            }
        })
        .then($ => {

          $('.coursebox.clearfix .info .coursename').each((i, el) => {

            this.courses.push({url: $(el.children[0]).attr('href'), name: $(el.children[0]).text()});

          });

          return resolve(this.courses)

        })

        .catch(err => {

          return reject(err);

        })

      }

    )

  }

  auth(){

    return new Promise(

      (resolve, reject) => {

        req = require("request-promise").defaults({
          jar: true
        });

        req('https://dolly.ingmo.unimore.it/2019/auth/shibboleth/index.php') // gather some cookies for authorization
          .then(body => {

            this.authenticating = true;
            return req({
                method: 'POST',
                uri: 'https://idp-bo.unimore.it/idp/profile/SAML2/Redirect/SSO?execution=e1s1',
                form: {
                  j_username: this.username,
                  j_password: this.password,
                  _eventId_proceed: ''
                },
                transform: function (body) {
                  return cheerio.load(body);
                }
              })

          })

          .then(body => {

            this.authenticating = false;
            const $ = body,
            samlResponse = $('input[name^="SAMLResponse"]').val(),
            relayState = $('input[name^="RelayState"]').val();

            return req({
              method: 'POST',
              uri: 'https://dolly.ingmo.unimore.it/Shibboleth.sso/SAML2/POST',
              followAllRedirects: true,
              form: {
                SAMLResponse: samlResponse,
                RelayState: relayState
              }
            })

          })

          .then(success => {

            return resolve(true)

          })

          .catch(err => {

            if(this.authenticating)
              err = {success: false, error: 'invalid_credentials'}
            return reject(err)

          })

      }

    )

  }

}

module.exports = Scraper;

/*    return

  })

  .then($ => {



  })

  .catch(err => {

    throw err;

  })*/
