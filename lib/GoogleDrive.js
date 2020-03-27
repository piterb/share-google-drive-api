const { JWT } = require("google-auth-library");
const Axios = require("axios");
const AxiosLogger = require("axios-logger");
AxiosLogger.setGlobalConfig({
  headers: true
});

class GoogleDrive {
  constructor(config) {
    this.config = config ? config : {};
    return this;
  }

  /**
   * Authorize using JWT token
   * @param {} credentials Credentials JSON downloaded from the google service account
   */
  async authorizeJWT(credentials) {
    const GOOGLE_AUTH_SCOPES = [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/documents.readonly",
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/spreadsheets.readonly"
    ];

    // Authenticate
    this.jwtClient = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: GOOGLE_AUTH_SCOPES
    });

    await this.jwtClient.authorize();

    return this.jwtClient;
  }

  /**
   * Exports a file in a specified mimeType. See https://developers.google.com/drive/api/v3/reference/files/export
   *
   * @param {*} fileId Id of the file in google drive
   * @param {*} mimeType Mime type, e.g. text/html
   */
  async export(fileId, mimeType) {
    this.axios = Axios.create({
      baseURL: `https://www.googleapis.com/drive/v3/files/${fileId}/export`,
      headers: {
        Authorization: `Bearer ${this.jwtClient.credentials.access_token}`
      }
    });

    if (this.config.trace == 1) {
      this.axios.interceptors.request.use(
        AxiosLogger.requestLogger,
        AxiosLogger.errorLogger
      );
      this.axios.interceptors.response.use(
        AxiosLogger.responseLogger,
        AxiosLogger.errorLogger
      );
    }

    var response = await this.axios.get("/", {
      params: {
        mimeType: mimeType
      }
    });

    return response;
  }
}

exports.GoogleDrive = GoogleDrive;
