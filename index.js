const ovh = require("ovh");
const polka = require("polka");

require("dotenv").config();

const billingAccount = process.env.BILLING_ACCOUNT;
const serviceName = process.env.SERVICE_NAME;

const client = ovh({
  appKey: process.env.APP_KEY,
  appSecret: process.env.APP_SECRET,
  consumerKey: process.env.CONSUMER_KEY
});

const app = polka();

app.post("/", (req, res) => {
  console.log("Listing", req.params);

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
  console.log("Blocking", req.params);

  res.end(
    JSON.stringify({
      id: "yolo"
    })
  );
});

app.post("/unblock", (req, res) => {
  console.log("Unblocking", req.params);

  res.end(
    JSON.stringify({
      id: "yolo"
    })
  );
});

const port = process.env.PORT || 3000;
app.listen(port, err => {
  if (err) throw err;
  console.log(`> Running on localhost:${port}`);
});
