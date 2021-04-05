const parser = require("@asyncapi/parser");
const path = require("path");
const fs = require("fs");

const relation = new Map(); // Map having channels as keys and values as objects containing subscribe and publish arrays

const rideDirectory = "./flightService";

function traverseChannel(doc) {
  return new Promise((resolve, reject) => {
    if (doc.hasChannels()) {
      doc.channelNames().forEach((channelName) => {
        let _obj;
        if (relation.has(channelName)) {
          _obj = relation.get(channelName);
        } else {
          _obj = {
            sub: new Array(),
            pub: new Array(),
          };
        }

        const channel = doc.channel(channelName);
        const title = doc.info().title();

        if (channel.hasPublish()) {
          _obj.pub.push(title);
        }
        if (channel.hasSubscribe()) {
          _obj.sub.push(title);
        }

        relation.set(channelName, _obj);
      });
    }
    resolve(relation);
  });
}

function readFiles(files) {
  return new Promise(function (resolve, reject) {
    files.forEach(async (file, index) => {
      try {
        let document_path = path.join(rideDirectory, file);
        let asyncApiDoc = fs.readFileSync(
          path.resolve(__dirname, document_path),
          "utf8"
        );

        let doc = await parser.parse(asyncApiDoc);
        // console.log(doc);
        _relations = await traverseChannel(doc);
        resolve(_relations);
      } catch (err) {
        reject(err);
      }
    });
  });
}

function getRelations() {
  fs.readdir(rideDirectory, async (err, files) => {
    if (err) {
      console.error("Could not list the directory.", err);
      process.exit(1);
    }
    try {
      const result = await readFiles(files);
      console.log(result);
    } catch (err) {
      console.log(err);
    }
  });
}

getRelations();