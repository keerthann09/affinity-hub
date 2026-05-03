import AgoraRTC from "agora-rtc-sdk-ng";

const APP_ID = "da95a58caea341e8a062c20325a344c2";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

export const joinCall = async (channelName, callType) => {
  await client.join(APP_ID, channelName, null, null);

  const tracks = [];

  if (callType === "audio" || callType === "video") {
    const micTrack = await AgoraRTC.createMicrophoneAudioTrack();
    tracks.push(micTrack);
  }

  if (callType === "video") {
    const cameraTrack = await AgoraRTC.createCameraVideoTrack();
    tracks.push(cameraTrack);
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
    callback(user, mediaType);
  });
};

export default client;