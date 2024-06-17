// https://fivemanage.com/?ref=overextended

const apiKey = GetConvar('FIVEMANAGE_LOGS_API_KEY', '');
const endpoint = 'https://api.fivemanage.com/api/logs/batch';

const headers = {
  ['Content-Type']: 'application/json',
  ['Authorization']: apiKey,
  ['User-Agent']: 'oxmysql',
};

const batchedLogs = [];

async function sendLogs() {
  try {
    const body = JSON.stringify(batchedLogs);
    batchedLogs.length = 0;

    const response = await fetch(endpoint, {
      method: 'POST',
      body: body,
      headers: headers,
    });

    if (response.ok) return;

    console.error(`Failed to submit logs to fivemanage - ${response.status} ${response.statusText}`);
  } catch (err) {
    console.error(err);
  }
}

async function logger(level, resource, message, metadata) {
  if (!apiKey) return;

  if (batchedLogs.length === 0) setTimeout(sendLogs, 500);

  batchedLogs.push({
    level: level,
    message: message,
    resource: resource,
    metadata: metadata,
  });
}

function errorEvent(data) {
  delete data.err.sqlMessage;
  logger('error', data.resource, `${data.resource} was unable to execute a query!`, data.err);
}

on('oxmysql:error', errorEvent);
on('oxmysql:transaction-error', errorEvent);
