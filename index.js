const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cheerio = require('cheerio');


const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());


const dbUrl = 'mongodb://localhost:27017/resultTwo';
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));
const Schema = mongoose.Schema;
const blogPostSchema = new Schema({
    name: String,
    fatherName: String,
    motherName: String,
    collegeName: String,
    session: String,
    enrollmentNo: String,
    totalMarks: String,
    sgpa: String,
    cgpa: String,
    result: String,
    rollNo: String,
    course: String,
    html: String,
    date: { type: Date, default: Date.now }
});
const BlogPost = mongoose.model('BlogPost', blogPostSchema);


app.post('/', async (req, res) => {
    const a = await req.body;
    if (a?.rollNo?.length != 6) {
        return res.json({ success: false })
    }

    async function openNewBrowser(tenRollNoStartFrom) {
        const browser = await puppeteer.launch({ headless: false });

        async function findOne(rollNo) {
            try {
            const page = await browser.newPage();
            await page.goto('https://result24.shekhauniexam.in/NEP_RESULT.aspx', { timeout: 100000 });
            await page.select('select#DDL_RESULT', 'MAIN');
            await page.type('input[name="txtfromNo"]', `${rollNo}`);

            const [response] = await Promise.all([
                page.waitForNavigation(),
                await page.click('#btnSave')
            ]);
            const html = await page.evaluate(() => document.documentElement.outerHTML);
            const $ = cheerio.load(html);
            const name = $('#ContentPlaceHolder1_lblname').html();
            const fatherName = $('#ContentPlaceHolder1_lblfather').text();
            const motherName = $('#ContentPlaceHolder1_lblmother').text();
            const collegeName = $('#ContentPlaceHolder1_lblcollege').text();
            const enrollmentNo = $('td:contains("Enrollment No")').next().next().text();
            const session = $('#ContentPlaceHolder1_lblsession').text();
            const course = $('#ContentPlaceHolder1_lblcollege0').text();


            if (name != null) {
                let data = {
                    name: "", fatherName: "", motherName: "",
                    collegeName: "", session: "",
                    enrollmentNo: "", totalMarks: "", sgpa: "",
                    cgpa: "", result: "", rollNo: rollNo, course: ""
                }
                data = {
                    ...data, name: name, fatherName: fatherName.trim().split('\n')[0], motherName: motherName,
                    enrollmentNo: enrollmentNo.trim().split('\n')[0], collegeName: collegeName,
                    session: session, course: course
                };
                const table = $('table').filter((i, table) => {
                    return $(table).hasClass('result_tb') && $(table).attr('width') === '100%';
                });
                const tableRows = table.find('tr');

                tableRows.each((index, row) => {
                    const tableCells = $(row).find('td');
                    let helperToGet = false;
                    let helperToGetval = 0;
                    tableCells.each((index, cell) => {
                        const cellText = $(cell).text().trim();
                        if (cellText == 500) {
                            helperToGet = true;
                        }
                        if (helperToGet) {
                            helperToGetval++;
                        }
                        if (helperToGetval == 2) {
                            data = { ...data, totalMarks: cellText };
                        }
                        if (helperToGetval == 7) {
                            data = { ...data, sgpa: cellText }
                        }
                        if (helperToGetval == 8) {
                            data = { ...data, cgpa: cellText }
                        }
                        if (helperToGetval == 9) {
                            data = { ...data, result: cellText }
                        }
                    });
                });

                const newBlogPost = new BlogPost({
                    name: data.name,
                    fatherName: data.fatherName,
                    motherName: data.motherName,
                    collegeName: data.collegeName,
                    session: data.session,
                    enrollmentNo: data.enrollmentNo,
                    totalMarks: data.totalMarks,
                    sgpa: data.sgpa,
                    cgpa: data.cgpa,
                    result: data.result,
                    rollNo: rollNo,
                    course: course,
                    html: html
                });
                await newBlogPost.save()
                console.log(data);

            }
            await page.close();
        }
        catch (error) {
            console.log(error);
        }
            return;
        }

        let count = 0;
        async function rahul(roll) {
            if (count == 10) {
                return;
            }
            await findOne(roll);
            roll++;
            count++;
            return rahul(roll);
        }

        await rahul(tenRollNoStartFrom);
        browser.close();
    }

    async function loop(rollNoo) {
        if(rollNoo >= "242300") {
            return;
        }

        const rollNumbersPart1 = Array.from({ length: 2 }, (_, i) => `${rollNoo}${i}0`);
        const rollNumbersPart2 = Array.from({ length: 2 }, (_, i) => `${rollNoo}${i + 2}0`);
        const rollNumbersPart3 = Array.from({ length: 2 }, (_, i) => `${rollNoo}${i + 4}0`);
        const rollNumbersPart4 = Array.from({ length: 2 }, (_, i) => `${rollNoo}${i + 6}0`);
        const rollNumbersPart5 = Array.from({ length: 2 }, (_, i) => `${rollNoo}${i + 8}0`);
        await Promise.all(rollNumbersPart1.map(roll => openNewBrowser(`${roll}`)));
        await Promise.all(rollNumbersPart2.map(roll => openNewBrowser(`${roll}`)));
        await Promise.all(rollNumbersPart3.map(roll => openNewBrowser(`${roll}`)));
        await Promise.all(rollNumbersPart4.map(roll => openNewBrowser(`${roll}`)));
        await Promise.all(rollNumbersPart5.map(roll => openNewBrowser(`${roll}`)));
        rollNoo++;
        return loop(rollNoo);
    }

    loop(a.rollNo);



    return res.json({ success: true });
});


const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


