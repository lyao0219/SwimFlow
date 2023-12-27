const url = window.location.href;
const jsonId = url.split("?")[1];
const participantId = jsonId.split("_")[0];
const versionId = jsonId.split("_")[1];