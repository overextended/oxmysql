// https://fivemanage.com/?ref=overextended

const apiKey = GetConvar('FIVEMANAGE_LOGS_API_KEY', '');

if (!apiKey) return console.warning(`convar "FIVEMANAGE_LOGS_API_KEY" has not been set`);

const batchedLogs = [];
const endpoint = 'https://api.fivemanage.com/api/logs/batch';
const headers = {
  ['Content-Type']: 'application/json',
  ['Authorization']: apiKey,
  ['User-Agent']: 'oxmysql',
};

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

return function logger(data) {
  if (batchedLogs.length === 0) setTimeout(sendLogs, 500);

  batchedLogs.push(data);
};
