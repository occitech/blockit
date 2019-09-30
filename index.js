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

app.use(bodyParser.urlencoded({ extended: false }));
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
    .then(result => {
      const message =
        "Les numéros actuellement bloqués sont :\n\n" +
        result
          .map(number => `* ${number.callNumber} (id : \`${number.id}\`)`)
          .join("\n");

      res.end(message);
    })
    .catch(e => console.error(e));
});

app.post("/block", (req, res) => {
  const message = req.body.text || "";
  console.log("Blocking", req.params, req.body, message);
  if (!message.startsWith("+")) {
    res.end(
      `NOPE! Le numéro "${message}" n'est pas au format international (ex : +33102030405).`
    );
    return;
  }

  const payload = {
    nature: "international",
    type: "incomingBlackList",
    callNumber: message
  };
  client
    .requestPromised(
      "POST",
      `/telephony/${billingAccount}/screen/${serviceName}/screenLists`,
      payload
    )
    .then(() => res.end(`YO! ${message} bloqué.`))
    .catch(e => {
      console.log("ERREUR", e);
      res.end(`OOPS! Une erreur est survenue.`);
    });
});

app.post("/unblock", (req, res) => {
  const id = req.body.text || "";
  console.log("Unblocking", req.params, req.body, id);

  client
    .requestPromised(
      "DELETE",
      `/telephony/${billingAccount}/screen/${serviceName}/screenLists/${id}`
    )
    .then(() => res.end(`YO! ${id} débloqué.`))
    .catch(e => {
      console.log("ERREUR", e);
      res.end(`OOPS! Une erreur est survenue.`);
    });
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
