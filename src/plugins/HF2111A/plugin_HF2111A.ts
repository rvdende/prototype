import * as events from "events"
import * as net from "net"
import express = require('express');

import { Plugin } from "../plugin"
import { readFile } from "fs";

import { DeviceHF2111A } from "./device_HF2111A"

import { test } from "./test"

class PluginHF2111a extends Plugin {
  name = "hf2111a";
  port = 12900;
  eventHub: events.EventEmitter;

  constructor() {
    super();
    this.log("TEST ADSF")
  }

  public init(app: express.Express, db: any, eventHub: events.EventEmitter) {
    this.eventHub = eventHub;

    this.log("INIT HFHAKSFL")

    app.get("/api/v3/plugins/" + this.name + "/info", (req: Express.Request, res: express.Response) => {
      console.log("!!")
      res.json({ port: this.port });
    });

    app.get("/api/v3/plugins/" + this.name + "/test", (req: Express.Request, res: express.Response) => {
      test();
      res.json({})
    });

    this.runServer();
  }

  runServer() {
    this.log("runServer()")

    var server = net.createServer((client) => {
      var device = new DeviceHF2111A(client);

      device.on("connected", (device) => {
        console.log(device);

        this.eventHub.emit("device", {
          apikey: "4oxk9bg32xyncaxr6494z6jkqxb61tmf",
          packet: {
            id: "hf2111a_" + device.iccid,
            data: {
              device
            },
            meta: { method: this.name }
          },

        })
      })
      // console.log(this.name + " new connection from " + client.remoteAddress)
      // client.on("data", (data) => {
      //   console.log(data);
      //   console.log(data.toString())
      // })
    })

    console.log(this.name + " starting on port " + this.port);
    server.listen(this.port);
  }
}

export default new PluginHF2111a();

// export const name = "hf2111a";
// const port = 12900;

// export function init(app: express.Express, db: any, eventHub: events.EventEmitter) {
//   app.get(plugin + name + "/info", (req: Express.Request, res: express.Response) => {
//     res.json({ port });
//   });
//   runServer();
// }



// function runServer() {

//   var server = net.createServer((client) => {
//     console.log(name + " new connection from " + client.remoteAddress)
//     client.on("data", (data) => {
//       console.log(data);
//       console.log(data.toString())
//     })
//   })

//   console.log(name + " starting on port " + port);
//   server.listen(port);
// }