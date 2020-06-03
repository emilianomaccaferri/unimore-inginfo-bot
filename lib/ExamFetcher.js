const cheerio = require('cheerio');
const rp = require("request-promise");

class ExamFetcher {

    constructor(config) {

        // init some staff

        rp.defaults({
            jar: true,
            headers: {

                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0',
                'Referer': 'https://www.esse3.unimore.it/LoginInfo.do?menu_opened_cod=',

            },
            auth: {
                'user': config.username,
                'pass': config.password,
                sendImmediately: false
            },
            followAllRedirects: true,
            resolveWithFullResponse: true
        });

        /*this.auth()
            .catch(err => {

                throw err;

            })*/

    }

    getExams() {

        return new Promise(

            (resolve, reject) => {

                rp.post({
                    url: 'https://www.esse3.unimore.it/Guide/PaginaListaAppelli.do', form: {

                        FAC_ID: 10005,
                        CDS_ID: 10296,
                        AD_ID: 'X',
                        DOCENTE_ID: 'X',
                        DATA_ESA: '',
                        form_id_form1: 'form1',
                        actionBar1: 'Cerca'

                    }

                })

                    .then(data => {

                        let $ = cheerio.load(data),
                            exams = {};

                        $("#tableAppelli .table-1-body tr").each((i, el) => {

                            let e = $(el);

                            let exam_name = $(e.children()[0]).text(),
                                available = $(e.children()[1]).text(),
                                date = $(e.children()[2]).text(),
                                type = $(e.children()[3]).text(),
                                teacher = $(e.children()[4]).text(),
                                part = $(e.children()[5]).text();

                            if (exam_name.charAt(0) != '[')
                                return;
                            if (!exams.hasOwnProperty(exam_name))
                                exams[exam_name] = [{ available, date, type, teacher, part }]
                            else
                                exams[exam_name].push({ available, date, type, teacher, part })

                        })

                        return resolve(exams);

                    })

                    .catch(async (err) => {

                        if (err.statusCode === 401) {
                            await this.auth();
                            await this.getExams();
                        }
                        else
                            reject(err);

                    })

            }

        )

    }

    auth() {

        return new Promise(

            (resolve, reject) => {

                rp
                    .get('https://www.esse3.unimore.it/Home.do')
                    .then(data => {

                        return rp.get('https://www.esse3.unimore.it/auth/Logon.do')

                    })

                    .then(success => {

                        resolve(true);

                    })

                    .catch(err => {

                        reject(err);

                    })

            }

        )

    }

}

module.exports = ExamFetcher;