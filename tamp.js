import axios from 'axios';
let html = "";
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
  console.error("error  " + formNo + " year " + year + " month " + month + " date " + date);
  return findOne(formNo, year, month, date);
}