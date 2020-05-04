const con = require('../../../../common/database/mysql');
const util = require('util');
const query = util.promisify(con.query).bind(con);
const CronJob = require('cron').CronJob;
const { databaseName } = require('../../../../config');
const { errorHandler } = require('../../../../common/error');

/**
 * This cron job will run on every month on 1st at 12:00 am
 * It will delete all records from tables WHERE isDeleted=true
 */
new CronJob(
  '00 00 00 01 * *',
  async function () {
    try {
      const sqlSelectCall = `
        SELECT DISTINCT TABLE_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE COLUMN_NAME IN ('isDeleted')
        AND TABLE_SCHEMA='afoofaDB'`;
      const getTables = await query(sqlSelectCall);
      console.log('getTables', getTables);
      if (getTables.length > 0) {
        const tablesInfo = [];
        for (let i = 0; i < getTables.length; i++) {
          tablesInfo.push(getTables[i].TABLE_NAME);
        }
        const tables = tablesInfo.join(',');
        const sqlDeleteCall = `DELETE FROM ${tables} WHERE isDeleted=1`;
        const deletedDetails = await query(sqlDeleteCall);
        console.log('getDetails', deletedDetails);
      }
    } catch (error) {
      errorHandler(error);
    }
  },
  null,
  true
);
