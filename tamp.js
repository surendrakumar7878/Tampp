const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "papa.kaa.dinosaur@gmail.com",                 //your mail
    pass: "tqkp kvua arno wbgf",                                   //password of your mail    (its not gmail password you have to create this password from your google account)
  },
});


async function main() {
  const info = await transporter.sendMail({
    from: 'papa.kaa.dinosaur@gmail.com',       //server mail   (jis se mail send hoga vo vali email)
    to: "kamleshksks456@gmail.com",              //Reciever mail
    subject: "Hello ✔", 
    text: "Hello world?", 
    html: "<b>Hello world?</b>", 
  });

  console.log("Message sent: %s", info.messageId);
}

main().catch(console.error);