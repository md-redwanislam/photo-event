import axios from "axios";

import config from "../configs/config";

export const sendSMS = async (
  mobile: string,
  message: string,
): Promise<boolean> => {
  const url = `http://${config.sms.host}:${config.sms.port}/sendtext`;

  const params = {
    apikey: config.sms.apiKey,
    secretkey: config.sms.secretKey,
    callerID: config.sms.callerID,
    toUser: mobile,
    messageContent: message,
  };

  try {
    const response = await axios.get(url, { params });

    return true;
  } catch (error: any) {
    console.error("SMS Error:", error?.response?.data || error.message);

    return false;
  }
};
