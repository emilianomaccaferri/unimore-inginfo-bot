const Scraper = require("./Scraper");
const cheerio = require("cheerio");
const EventEmitter = require('events');

class CourseFetcher extends EventEmitter{

  constructor(course, req, timeout, id){

    super();
    this.id = id;
    this.url = course.url;
    this.course_name = course.name;
    this.request = req;
    this.timeout = timeout;
    this.queue = [];
    this.polling;
    this.firstTime = true;

  }

  stop(){

    clearTimeout(this.polling)

  }

  init(){

    this.polling = setInterval(() => {

      // polling

      this.request({
        method: 'GET',
        uri: this.url,
        transform: function(body){
          return cheerio.load(body)
        }
      })
        .then($ => {

          var newQueue = [];
          $('.topics .section.main.clearfix').each((i, el) => {

            var post_title = $(el).attr('aria-label');
            var link = $(el).find('a').toArray()[0];

            newQueue.push({post_title, url: $(link).attr('href'), text: $(link).text()});

          })

          if(newQueue.length == 0)
            return this.emit('empty', {title: this.course_name});

          var diff = this.queue.difference(newQueue);
          if(this.firstTime){
            this.firstTime = false;
            return this.emit('first-time', {title: this.course_name, stuff: newQueue})
          }
          if(diff.length){
            this.emit('new-posts', {title: this.course_name, stuff: diff})
            this.queue = [...newQueue, ...this.queue];
          }else {
            console.log(`niente di nuovo su ${this.course_name}`);
          }

        })

        .catch(err => {

          this.emit('expired')

        })

    }, this.timeout)

    return this;

  }

}

Array.prototype.difference = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

module.exports = CourseFetcher;
