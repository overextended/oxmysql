// https://fivemerr.com

const apiKey = GetConvar("FIVEMERR_LOGS_API_KEY", "");

if (!apiKey) return console.warning(`convar "FIVEMANAGE_LOGS_API_KEY" has not been set`);

const batchedLogs = [];
const endpoint = 'https://api.fivemerr.com/v1/logs';
const headers = {
  ['Content-Type']: 'application/json',
  ['Authorization']: apiKey,
  ['User-Agent']: 'oxmysql',
};

async function sendLogs() {
  for (let index = 0; index < batchedLogs.length; index++) {
    try {
      const body = JSON.stringify(batchedLogs[index]);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: body,
        headers: headers,
      });

      if (response.ok) return;

      console.error(`Failed to submit logs to fivemerr - ${response.status} ${response.statusText}`);
    } catch (err) {
      console.error(err);
    }
  }
  batchedLogs.length = 0;
}

return function logger(data) {
  if (batchedLogs.length === 0) setTimeout(sendLogs, 500);

  batchedLogs.push(data);
};
