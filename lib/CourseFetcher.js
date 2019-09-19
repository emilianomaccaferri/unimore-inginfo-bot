const Scraper = require("./Scraper");
const cheerio = require("cheerio");
const fs      = require("fs-extra");
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
    this.dir = `./data/${this.id}`;

  }

  stop(){

    clearTimeout(this.polling)

  }

  async init(){

    await fs.ensureDir(this.dir);
    try{
      await fs.stat(`${this.dir}/latest.json`);
      var q = await fs.readJson(`${this.dir}/latest.json`);
      this.queue = q;
    }catch(err){
      await fs.ensureFile(`${this.dir}/latest.json`);
      await fs.outputJson(`${this.dir}/latest.json`, [])
    }


    this.polling = setInterval(() => {

      // polling

      this.request({
        method: 'GET',
        uri: this.url,
        transform: function(body){
          return cheerio.load(body)
        }
      })
        .then(async($) => {

          var newQueue = [];
          $('.topics .section.main.clearfix').each((i, el) => {

            var post_title = $(el).attr('aria-label');
            var link = $(el).find('a').toArray()[0];

            newQueue.push({post_title, url: $(link).attr('href'), text: $(link).text()});

          })

          if(newQueue.length == 0)
            return this.emit('empty', {title: this.course_name});

          var comparison = this.queue.compareToArrayOfObjects(newQueue);
          if(comparison.diff.length){
            if(this.queue.length > newQueue.length){
              this.emit('removed-posts', {title: this.course_name, stuff: comparison.diff})
              this.queue = newQueue
              await fs.outputJSON(`${this.dir}/latest.json`, this.queue)
            }else{
              this.emit('new-posts', {title: this.course_name, stuff: comparison.diff})
              this.queue = [...comparison.diff, ...this.queue];
              await fs.outputJSON(`${this.dir}/latest.json`, this.queue)
            }
          }
        })

        .catch(err => {

          console.log(err);
          this.emit('expired')

        })

    }, this.timeout)

  }

}

Array.prototype.compareToArrayOfObjects = function(a) {

    var diff = []
        updates = [];

    if(a.length > this.length){
      a.forEach((object, k) => {

        var values = Object.values(object);
        var thisValues = Object.values(this[k] || []);
        if(thisValues.length){
          for(var i = 0, len = values.length; i < len; i++){
            if(values[i] !== thisValues[i]){
              k++;
            }
          }
        }
        else
          diff.push(object);
      })
    }else{
      this.forEach((object, k) => {

        var values = Object.values(object);
        var thisValues = Object.values(a[k] || []);
        if(thisValues.length){
          for(var i = 0, len = values.length; i < len; i++){
            if(values[i] !== thisValues[i]){
              k++;
            }
          }
        }
        else
          diff.push(object);
      })
    }

    return {diff, updates};
};

module.exports = CourseFetcher;
