import AgoraRTC from "agora-rtc-sdk-ng";

const APP_ID = "da95a58caea341e8a062c20325a344c2";
const BACKEND_URL = "https://affinity-hub.onrender.com";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

const getToken = async (channelName) => {
  const res = await fetch(`${BACKEND_URL}/api/agora/token?channelName=${channelName}&uid=0`);
  const data = await res.json();
  return data.token;
};

export const joinCall = async (channelName, callType) => {
  const token = await getToken(channelName);
  await client.join(APP_ID, channelName, token, null);

  const tracks = [];

  if (callType === "audio" || callType === "video") {
    const micTrack = await AgoraRTC.createMicrophoneAudioTrack();
    tracks.push(micTrack);
  }

  if (callType === "video") {
    const cameraTrack = await AgoraRTC.createCameraVideoTrack();
    tracks.push(cameraTrack);
    // ✅ Play local video in div
    cameraTrack.play("local-video");
  }

  await client.publish(tracks);
  return { client, tracks };
};

export const leaveCall = async (tracks) => {
  if (tracks) {
    tracks.forEach(track => {
      track.stop();
      track.close();
    });
  }
  await client.leave();
};

export const onUserJoined = (callback) => {
  client.on("user-published", async (user, mediaType) => {
    await client.subscribe(user, mediaType);
    if (mediaType === "video") {
      // ✅ Play remote video in div
      user.videoTrack?.play("remote-video");
    }
    if (mediaType === "audio") {
      user.audioTrack?.play();
    }
    callback(user, mediaType);
  });
};

export default client;