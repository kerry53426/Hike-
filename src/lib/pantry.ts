import { Registration } from "../types";

const PANTRY_ID = "085e1276-c22a-4c58-9a2b-3b40d8fce6d9";
const BASKET_NAME = "sheipa_registrations";
const BASE_URL = `https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket/${BASKET_NAME}`;

export const getRegistrations = async (): Promise<Record<string, Registration>> => {
  try {
    const res = await fetch(BASE_URL);
    if (!res.ok) {
        if (res.status === 400 || res.status === 404) return {};
        throw new Error("Failed");
    }
    const data = await res.json();
    return data || {};
  } catch(e) {
    console.error(e);
    return {};
  }
};

export const updateRegistration = async (docId: string, payload: Registration | {deleted: true}) => {
   await fetch(BASE_URL, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ [docId]: payload })
   });
};
