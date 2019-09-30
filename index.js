const ovh = require("ovh");
const polka = require("polka");
const bodyParser = require("body-parser");

require("dotenv").config();

const billingAccount = process.env.BILLING_ACCOUNT;
const serviceName = process.env.SERVICE_NAME;

const client = ovh({
  appKey: process.env.APP_KEY,
  appSecret: process.env.APP_SECRET,
  consumerKey: process.env.CONSUMER_KEY
});

const app = polka();

app.use(bodyParser.json());

app.post("/", (req, res) => {
  console.log("Listing", req.params, req.body);

  client
    .requestPromised(
      "GET",
      `/telephony/${billingAccount}/screen/${serviceName}/screenLists`
    )
    .then(v =>
      Promise.all(
        v.map(id =>
          client.requestPromised(
            "GET",
            `/telephony/${billingAccount}/screen/${serviceName}/screenLists/${id}`
          )
        )
      )
    )
    .then(result => res.end(JSON.stringify(result)))
    .catch(e => console.error(e));
});

app.post("/block", (req, res) => {
  console.log("Blocking", req.params, req.body);

  res.end(
    JSON.stringify({
      id: "yolo"
    })
  );
});

app.post("/unblock", (req, res) => {
  console.log("Unblocking", req.params, req.body);

  res.end(
    JSON.stringify({
      id: "yolo"
    })
  );
});

app.get("/", (_, res) => {
  res.end("Hello world!");
});

const host = process.env.HOST || "0.0.0.0";
const port = process.env.PORT || 3000;
app.listen(port, host, err => {
  if (err) throw err;
  console.log(`> Running on ${host}:${port}`);
});
