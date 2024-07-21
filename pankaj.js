const cheerio = require('cheerio');
const fs = require('fs');
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
    const response = await axios.post('https://result.uniraj.ac.in/index.php?rid=9763',
        `Studroll=${formNo}&Studdob=${year}-${month}-${date}&OKbtn=`,
        {
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.6',
                'Cache-Control': 'ax-age=0',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Sec-Ch-Ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Brave";v="126"',
                'Sec-Ch-Ua-Mobile': '?1',
                'Sec-Ch-Ua-Platform': '"Android"',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'ame-origin',
                'Sec-Fetch-User': '?1',
                'Sec-Gpc': '1',
                'Upgrade-Insecure-Requests': '1',
                'Referer': 'https://result.uniraj.ac.in/index.php?rid=9763',
                'Referrer-Policy': 'trict-origin-when-cross-origin'
            }
        }
    );
    const resultt = response.data;
    html = resultt
    }
    catch (error) {
        console.error("error  " + formNo + " year " + year + " month " + month + " date " + date);
        return findOne(formNo, year, month, date);
    }

    log("found  " + formNo + " year " + year + " month " + month + " date " + date);
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
        if (isTaskTrue) {
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




let fn = 240382848;
let yy = [2004, 2005, 2003, 2006, 2002, 2007, 2001, 2008];
let c = 0;
async function loop() {
    console.log("loop runned");
    if (fulfilled) {
        fn++;
        c = 0;
        fulfilled = false;
        loop();
    }
    else {
        await findOneYear(fn, yy[c]);
        c++;
        if (yy[c] == 2008) {
            fn++;
            c = 0;
        }
        loop();
    }
}


// loop()


// findOneMonth(240382647,2005,4).then(()=> console.log(fulfilled));
