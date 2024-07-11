"use client";

import React, { useState } from "react";
import { loadConnectAndInitialize } from "@stripe/connect-js";
import {
  ConnectIssuingCard,
  ConnectComponentsProvider,
} from "@stripe/react-connect-js";
import { loadStripe } from "@stripe/stripe-js";

const cardId = "";
const publishableKey = "";
const accountId = "";
const apiVersion = "2024-06-20;embedded_connect_beta=v2";

export default function PaymentsComponent() {
  const [stripeConnectInstance] = useState(() => {
    const fetchClientSecret = async () => {
      // Fetch the AccountSession client secret
      const response = await fetch(
        "http://localhost:5000/create-account-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) {
        // Handle errors on the client side here
        const { error } = await response.json();
        console.log("An error occurred: ", error);
        return undefined;
      } else {
        const { clientSecret } = await response.json();
        return clientSecret;
      }
    };
    return loadConnectAndInitialize({
      // This is your test publishable API key.
      publishableKey: publishableKey,
      fetchClientSecret: fetchClientSecret,
      appearance: {
        overlays: "dialog",
        variables: {
          colorPrimary: "#625afa",
        },
      },
    });
  });

  const fetchEphemeralKey = async () => {
    try {
      const stripe = await loadStripe(publishableKey, {
        stripeAccount: accountId,
        apiVersion: apiVersion,
      });
      if (!stripe) {
        throw new Error("Failed to load Stripe");
      }
      console.log("stripe loaded");
      const nonce = await stripe.createEphemeralKeyNonce({
        issuingCard: cardId,
      });
      console.log("nonce loaded", nonce);
      const response = await fetch("http://localhost:5000/ephemeralKey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nonce: nonce.nonce,
        }),
      });
      if (!response.ok) {
        // Handle errors on the client side here
        const { error } = await response.json();
        console.log("An error occurred: ", error);
        throw new Error("Failed to fetch ephemeral key");
      } else {
        const { ephemeralKey } = await response.json();
        const res = {
          issuingCard: cardId,
          nonce: nonce.nonce,
          ephemeralKeySecret: ephemeralKey.secret,
        };
        console.log("ephemeral key loaded", res);

        return res;
      }
    } catch (e) {
      console.log(e);
      throw e;
    }
  };

  return (
    <div style={{ maxWidth: "800px", marginRight: "auto", marginLeft: "auto" }}>
      <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
        <ConnectIssuingCard
          fetchEphemeralKey={() => fetchEphemeralKey()}
          defaultCard={cardId}
          cardSwitching={false}
        />
      </ConnectComponentsProvider>
    </div>
  );
}
