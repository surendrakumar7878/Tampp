const puppeteer = require("puppeteer");
const mongoose = require('mongoose');
const cheerio = require('cheerio');


const dbUrl = 'mongodb+srv://kamleshksks456:LtnGz4tLIcrsYj0j@cluster0.shgns95.mongodb.net/shekhawati';
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));
const Schema = mongoose.Schema;
const blogPostSchema = new Schema({
    mobileNumber: String,
    dob: String,
    address: String,
    abcId: String,
    aadharNo: String,
    rollno: String,
    formno: String,
    email: String,
    college: String,
    name: String,
    signSrc: String,
    photoSrc: String,
    date: { type: Date, default: Date.now }
});
const BlogPost = mongoose.model('BlogPost', blogPostSchema);




function generateDaysOfMonth(month, year) {
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [];

    for (let day = 1; day <= daysInMonth; day++) {
        const dayString = day.toString().padStart(2, '0');
        days.push(dayString);
    }
    return days;
}





async function findOneMonth(month, year, formNo) {
    const browser = await puppeteer.launch({ headless: false });
    const days = generateDaysOfMonth(month, year);
    // const days = Array(31).fill(27);
    let count = 0;
    async function currentDay(date, month, year) {
        const page = await browser.newPage();
        await page.goto('https://exam.shekhauniexam.in/Reprint_Login.aspx', { timeout: 100000 });
        if (month == 1) {
            month = `01`;
        }
        await page.type('#ContentPlaceHolder1_txtdob', `${month}-${date}-${year}`);
        await page.type('input[name="ctl00$ContentPlaceHolder1$txtfrmrefno"]', `${formNo}`);
        await page.click('#ContentPlaceHolder1_btnstatus');
        try {
            await page.waitForNavigation({ timeout: 15000 });
            await page.$eval('#ContentPlaceHolder1_btnreprint', (el) => el.click());
            await page.waitForNavigation();
            const html = await page.evaluate(() => document.documentElement.outerHTML);


            const $ = cheerio.load(html);
            const mobileNumber = $('#lblmobile').text();
            const dob = $('#lbldob').text();
            const address = $('#lbladdess').text();
            const abcId = $('#lbl_ABCID').text();
            const aadharNo = $('#lblAadharNo').text();
            const rollno = $('#lblrollno').text();
            const formno = $('#lblformno').text();
            const email = $('#lblEmail').text();
            const college = $('#lblcollege').text();
            const name = $('#lblname').text();
            const signSrc = $('#ImgSign').attr('src');
            const photoSrc = $('#ImgPhoto').attr('src');
            const newBlogPost = new BlogPost({
                mobileNumber,
                dob,
                address,
                abcId,
                aadharNo,
                rollno,
                formno,
                email,
                college,
                name,
                signSrc,
                photoSrc
            });
           await newBlogPost.save()
            console.log({
                mobileNumber,
                dob,
                address,
                abcId,
                aadharNo,
                rollno,
                formno,
                email,
                college,
                name,
                signSrc,
                photoSrc
              });
            return;
        }
        catch {
            page.close();
            if (count >= days.length - 1) {
                return;
            }
            return currentDay(days[++count], month, year);
        }
    }
    await currentDay(days[count], month, year);
    if (count == days.length - 1) {
        browser.close();
    }
    return;
}


async function findOneYear(year, formNo) {
    const rollNumbersPart1 = Array.from({ length: 12 }, (_, i) => `${i + 1}`);
    const rollNumbersPart2 = Array.from({ length: 3 }, (_, i) => `${i + 4}`);
    const rollNumbersPart3 = Array.from({ length: 3 }, (_, i) => `${i + 7}`);
    const rollNumbersPart4 = Array.from({ length: 3 }, (_, i) => `${i + 10}`);

    await Promise.all(rollNumbersPart1.map(month => findOneMonth(month, year, formNo)));
    // await Promise.all(rollNumbersPart2.map(month => findOneMonth(month, year, formNo)));
    // await Promise.all(rollNumbersPart3.map(month => findOneMonth(month, year, formNo)));
    // await Promise.all(rollNumbersPart4.map(month => findOneMonth(month, year, formNo)));
    return;
}

findOneYear(2005, "240382647");



// findOneMonth(9, 2005, "240382647")