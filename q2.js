const ExpressBrute = require("express-brute");
const express = require("express");
const app = express();
const router = express.Router();

const store = new ExpressBrute.MemoryStore();
const bruteforces = {};

function bruteforce(namespace, freeRetries, minWait, usePromise = false) {
  minWait = minWait * 60 * 1000;

  if (!bruteforces[namespace]) {
    bruteforces[namespace] = new ExpressBrute(store, {
      freeRetries: freeRetries,
      minWait: minWait,
      failCallback: function (req, res, next, nextValidRequestDate) {
        res
          .status(429)
          .send(
            `Too many requests for the ${namespace} namespace. Please retry in ${Math.round(
              (nextValidRequestDate.getTime() - Date.now()) / 60000
            )} minutes`
          );
      },
    });
  }

  const middleware = bruteforces[namespace].prevent;

  if (usePromise) {
    return function (req, res) {
      return new Promise((resolve, reject) => {
        middleware(req, res, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    };
  } else {
    return middleware;
  }
}

app.use(bruteforce("global", 100, 5));

router.get("/v1/users", bruteforce("users", 1, 1), function (req, res) {
  res.send("Hello, user!");
});

router.get("/v1/apps", async function (req, res, next) {
  try {
    await bruteforce("apps", 1, 1, true)(req, res);
    res.send("Hello, app!");
  } catch (err) {
    res.status(err.code).send(err.message);
  }
});

app.use("/", router);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
