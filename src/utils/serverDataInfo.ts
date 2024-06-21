import http from "http";

export const serverDataInfo = (
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
) => {
  let data_totalOut = 0;
  let data_totalIn = 0;
  let data_allTime_totalOut = 0;
  let data_allTime_totalIn = 0;
  let date = 0;
  const hrs_24 = 86400000;

  const moment = require("moment");
  const requestStats = require("request-stats");
  const stats = requestStats(server);

  stats.on("complete", async (details: any) => {
    if (!date) {
      date = Date.now();
    }
    if (date - Date.now() >= hrs_24) {
      data_totalOut = 0;
      data_totalIn = 0;
    }

    // console.log({ res: details.res });

    var socketIp = null;
    if (details.req.socket) {
      if (details.req.socket.remoteAddress) {
        socketIp = details.req.socket.remoteAddress;
      }
    }

    var ip = socketIp || details.req.headers["x-real-ip"] || "N/A";

    data_totalIn = data_totalIn + details.req.bytes;
    data_totalOut = data_totalOut + details.res.bytes;
    data_allTime_totalIn = data_totalIn;
    data_allTime_totalOut = data_totalOut;

    let yellow = (input: string) => "\x1b[33m" + input + "\x1b[0m";
    let red = (input: string) => "\x1b[31m" + input + "\x1b[0m";
    let bright = (input: string) => "\x1b[1m" + input + "\x1b[0m";
    let cyan = (input: any) => "\x1b[36m" + input + "\x1b[0m";

    console.log(
      `ip: ${cyan(ip)}, ${bright("<--")}: ${yellow(
        String(data_allTime_totalIn / 1000)
      )}, ${bright("-->")}: ${red(
        String(data_allTime_totalOut / 1000)
      )}, time: ${moment().format("MMMM Do YYYY, h:mm:ss a")}`
    );
  });
};
