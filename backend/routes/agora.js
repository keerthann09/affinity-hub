const express = require("express");
const router = express.Router();
const { RtcTokenBuilder, RtcRole } = require("agora-token");

const APP_ID = "da95a58caea341e8a062c20325a344c2";
const APP_CERTIFICATE = "1694ad28792a4a41bd9654ee835e123f";

router.get("/token", (req, res) => {
  const { channelName, uid } = req.query;

  if (!channelName) {
    return res.status(400).json({ error: "Channel name required" });
  }

  const expirationTime = 3600;
  const currentTime = Math.floor(Date.now() / 1000);
  const expirationTimeInSeconds = currentTime + expirationTime;

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid || 0,
    RtcRole.PUBLISHER,
    expirationTimeInSeconds
  );

  res.json({ token });
});

module.exports = router;