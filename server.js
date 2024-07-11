const express = require("express");
const cors = require("cors"); // Require CORS
const req = require("express/lib/request");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const cardId = "";
const accountId = "";
const secretKey = "";
const apiVersion = "2024-06-20;embedded_connect_beta=v2";

app.post("/create-account-session", async (req, res) => {
  const stripe = require("stripe")(secretKey, {
    apiVersion: apiVersion,
  });

  try {
    const accountSession = await stripe.accountSessions.create(
      {
        account: accountId,
        components: {
          issuing_card: {
            enabled: true,
          },
        },
      },
      {
        apiVersion: apiVersion,
      }
    );

    res.json({ clientSecret: accountSession.client_secret });
  } catch (error) {
    console.error("Error creating account session:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/ephemeralKey", async (req, res) => {
  const { nonce } = req.body;

  const stripe = require("stripe")(secretKey, {
    apiVersion: apiVersion,
  });

  try {
    const ephemeralKey = await stripe.ephemeralKeys.create(
      {
        nonce: nonce,
        issuing_card: cardId,
      },
      {
        stripeAccount: accountId,
        apiVersion: apiVersion,
      }
    );

    res.json({ ephemeralKey: ephemeralKey });
  } catch (error) {
    console.error("Error creating ephemeral Key:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
