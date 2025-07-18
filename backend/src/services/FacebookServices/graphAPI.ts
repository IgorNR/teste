import axios from "axios";
import FormData from "form-data";
import { createReadStream } from "fs";
import logger from "../../utils/logger";

const { FACEBOOK_API_VERSION = "v20.0" } = process.env;

const apiBase = (token: string) =>
  axios.create({
    baseURL: `https://graph.facebook.com/${FACEBOOK_API_VERSION}/`,
    params: {
      access_token: token
    }
  });

export const getAccessToken = async (): Promise<string> => {
  const { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET } = process.env;

  if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
    throw new Error("FACEBOOK_APP_ID_OR_SECRET_NOT_DEFINED");
  }

  const { data } = await axios.get(
    `https://graph.facebook.com/${FACEBOOK_API_VERSION}/oauth/access_token`,
    {
      params: {
        client_id: FACEBOOK_APP_ID,
        client_secret: FACEBOOK_APP_SECRET,
        grant_type: "client_credentials"
      }
    }
  );
  return data.access_token;
};

export const markSeen = async (id: string, token: string): Promise<void> => {
  await apiBase(token).post(`${id}/messages`, {
    recipient: { id },
    sender_action: "mark_seen"
  });
};

export const showTypingIndicator = async (
  id: string, 
  token: string,
  action: string
): Promise<void> => {
  try {
    const { data } = await apiBase(token).post("me/messages", {
      recipient: { id },
      sender_action: action
    });
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const sendText = async (
  id: string | number,
  text: string,
  token: string
): Promise<void> => {
  try {
    const { data } = await apiBase(token).post("me/messages", {
      recipient: { id },
      message: { text: `${text}` }
    });
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const sendAttachmentFromUrl = async (
  id: string,
  url: string,
  type: string,
  token: string
): Promise<void> => {
  try {
    const { data } = await apiBase(token).post("me/messages", {
      recipient: { id },
      message: {
        attachment: {
          type,
          payload: { url }
        }
      }
    });
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const sendAttachment = async (
  id: string,
  file: Express.Multer.File,
  type: string,
  token: string
): Promise<void> => {
  const formData = new FormData();
  formData.append("recipient", JSON.stringify({ id }));
  formData.append("message", JSON.stringify({
    attachment: {
      type,
      payload: { is_reusable: true }
    }
  }));

  const fileReaderStream = createReadStream(file.path);
  formData.append("filedata", fileReaderStream);

  try {
    await apiBase(token).post("me/messages", formData, {
      headers: { ...formData.getHeaders() }
    });
  } catch (error) {
    throw new Error(error);
  }
};

export const genText = (text: string): any => {
  return { text };
};

export const getProfile = async (id: string, token: string): Promise<any> => {
  try {
    const { data } = await apiBase(token).get(id);
    return data;
  } catch (error) {
    console.log(error);
    throw new Error("ERR_FETCHING_FB_USER_PROFILE_2");
  }
};

export const getPageProfile = async (
  id: string,
  token: string
): Promise<any> => {
  try {
    const { data } = await apiBase(token).get(
      `${id}/accounts?fields=name,access_token,instagram_business_account{id,username,profile_picture_url,name}`
    );
    return data;
  } catch (error) {
    console.log(error);
    throw new Error("ERR_FETCHING_FB_PAGES");
  }
};

export const profilePsid = async (id: string, token: string): Promise<any> => {
  try {
    const { data } = await apiBase(token).get(`${id}`);
    return data;
  } catch (error) {
    console.log(error);
    await getProfile(id, token);
  }
};

export const subscribeApp = async (id: string, token: string): Promise<any> => {
  try {
    const { data } = await apiBase(token).post(`${id}/subscribed_apps`, {
      subscribed_fields: [
        "messages",
        "messaging_postbacks",
        "message_deliveries",
        "message_reads",
        "message_echoes"
      ]
    });
    return data;
  } catch (error) {
    console.log(error);
    throw new Error("ERR_SUBSCRIBING_PAGE_TO_MESSAGE_WEBHOOKS");
  }
};

export const unsubscribeApp = async (
  id: string,
  token: string
): Promise<any> => {
  try {
    const { data } = await apiBase(token).delete(`${id}/subscribed_apps`);
    return data;
  } catch (error) {
    throw new Error("ERR_UNSUBSCRIBING_PAGE_TO_MESSAGE_WEBHOOKS");
  }
};

export const getSubscribedApps = async (
  id: string,
  token: string
): Promise<any> => {
  try {
    const { data } = await apiBase(token).get(`${id}/subscribed_apps`);
    return data;
  } catch (error) {
    throw new Error("ERR_GETTING_SUBSCRIBED_APPS");
  }
};

export const getAccessTokenFromPage = async (
  token: string
): Promise<string> => {
  try {
    if (!token) throw new Error("ERR_FETCHING_FB_USER_TOKEN");

    const { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET } = process.env;

    if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
      throw new Error("FACEBOOK_APP_ID_OR_SECRET_NOT_DEFINED");
    }

    const { data } = await axios.get(
      `https://graph.facebook.com/${FACEBOOK_API_VERSION}/oauth/access_token`,
      {
        params: {
          client_id: FACEBOOK_APP_ID,
          client_secret: FACEBOOK_APP_SECRET,
          grant_type: "fb_exchange_token",
          fb_exchange_token: token
        }
      }
    );
    return data.access_token;
  } catch (error) {
    console.log(error);
    throw new Error("ERR_FETCHING_FB_USER_TOKEN");
  }
};

export const removeApplication = async (
  id: string,
  token: string
): Promise<void> => {
  try {
    await apiBase(token).delete(`${id}/permissions`);
  } catch (error) {
    logger.error("ERR_REMOVING_APP_FROM_PAGE");
  }
};
