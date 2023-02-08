const nodemailer=require('nodemailer');

module.exports={
  mailTransporter:nodemailer.createTransport({
    service:'gmail',
    auth:{
      user: 'vishnupriyakolatt@gmail.com',
      pass: 'mbbfurrntmxzxwvn'
    },
  }),
  OTP:`${Math.floor(1000+Math.random()*9000)}`,
}