const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");
const bodyParser = require('body-parser');
const cheerio = require('cheerio');


const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());


app.post('/', async (req, res) => {
    const a = await req.body;
    if (a?.rollNo?.length != 6) {
        return res.json({ success: false })
    }

    async function openNewBrowser(tenRollNoStartFrom) {
        const browser = await puppeteer.launch({ headless: false });

        async function findOne(rollNo) {
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


            if (name != null) {
                let data = {
                    name: "", fatherName: "", motherName: "",
                    collegeName: "", session: "",
                    enrollmentNo: "", totalMarks: "", sgpa: "",
                    cgpa: "", result: "", rollNo: ""
                }
                data = {
                    ...data, name: name, fatherName: fatherName.trim().split('\n')[0], motherName: motherName,
                    enrollmentNo: enrollmentNo.trim().split('\n')[0], collegeName: collegeName,
                    session: session
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



                console.log(data);



            }
            await page.close();
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


    const rollNumbersPart1 = Array.from({ length: 6 }, (_, i) => `${a.rollNo}${i}0`);
    const rollNumbersPart2 = Array.from({ length: 4 }, (_, i) => `${a.rollNo}${i + 6}0`);
    await Promise.all(rollNumbersPart1.map(roll => openNewBrowser(`${roll}`)));
    await Promise.all(rollNumbersPart2.map(roll => openNewBrowser(`${roll}`)))


    return res.json({ success: true });
});


const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});




