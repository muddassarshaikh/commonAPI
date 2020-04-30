require('dotenv').config();

module.exports = {
  port: process.env[`${process.env.NODE_ENV}_PORT`],
  databaseHost: process.env[`${process.env.NODE_ENV}_DB_HOST`],
  databaseUser: process.env[`${process.env.NODE_ENV}_DB_USER`],
  databasePassword: process.env[`${process.env.NODE_ENV}_DB_PASSWORD`],
  databaseName: process.env[`${process.env.NODE_ENV}_DB_NAME`],
  databaseInitial: process.env[`${process.env.NODE_ENV}_DB_INITIAL`],
  database: process.env[`${process.env.NODE_ENV}_DB`],
  databasePort: process.env[`${process.env.NODE_ENV}_DB_PORT`],
  mongoDBConnectionString:
    process.env[`${process.env.NODE_ENV}_MONGO_DB_CONN_STRING`],
  emailVerificationLink:
    process.env[`${process.env.NODE_ENV}_EMAIL_VERIFICATION_LINK`],
  resetPasswordLink: process.env[`${process.env.NODE_ENV}_RESET_PASS_LINK`],
  tokenkey: process.env[`${process.env.NODE_ENV}_TOKEN_KEY`],
  bodyEncryption: false,
  supportEmail: process.env[`${process.env.NODE_ENV}_SUPPORT_EMAIL`],
  SMTPemailAddress: process.env[`${process.env.NODE_ENV}_SMTP_EMAILADDRESS`],
  SMTPPassword: process.env[`${process.env.NODE_ENV}_SMTP_PASS`],
  cryptokey: process.env[`${process.env.NODE_ENV_DB_PASS}_CRYPTO_KEY`],
  paypalURL: process.env[`${process.env.NODE_ENV}_PAYPAL_URL`],
  paypalClientId: process.env[`${process.env.NODE_ENV}_PAYPAL_CLIENTID`],
  paypalSecret: process.env[`${process.env.NODE_ENV}_PAYPAL_SECRET`],
  awsBucket: process.env[`${process.env.NODE_ENV}_AWS_BUCKET`],
  awsAccessKey: process.env[`${process.env.NODE_ENV}_AWS_ACCESS_KEY`],
  awsSecretAccessKey:
    process.env[`${process.env.NODE_ENV}_AWS_SECRET_ACCESS_KEY`],
};
