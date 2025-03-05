import { gapi } from "gapi-script"

const CLIENT_ID = "VOTRE_CLIENT_ID.apps.googleusercontent.com";
const API_KEY = "VOTRE_API_KEY";
const SCOPES = "https://www.googleapis.com/auth/drive.file";

export const initGoogleDriveApi = () => {
  return new Promise((resolve) => {
    gapi.load("client:auth2", () => {
      gapi.client
        .init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          scope: SCOPES,
        })
        .then(() => resolve(gapi));
    });
  });
};