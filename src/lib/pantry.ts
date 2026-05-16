import { Registration } from "../types";

const PANTRY_ID = "085e1276-c22a-4c58-9a2b-3b40d8fce6d9";
const BASKET_NAME = "sheipa_registrations";
const BASE_URL = `https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket/${BASKET_NAME}`;

export const getRegistrations = async (retries = 3): Promise<Record<string, Registration>> => {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(BASE_URL);
      if (!res.ok) {
          if (res.status === 400 || res.status === 404) return {};
          throw new Error("Failed");
      }
      const data = await res.json();
      return data || {};
    } catch(e) {
      if (i === retries - 1) {
        console.error("Failed to fetch after multiple retries:", e);
        return {};
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Wait before retrying
    }
  }
  return {};
};

export const updateRegistration = async (docId: string, payload: Registration | {deleted: true}, retries = 3) => {
  for (let i = 0; i < retries; i++) {
     try {
       const res = await fetch(BASE_URL, {
           method: "PUT",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ [docId]: payload })
       });
       if (!res.ok) throw new Error("Failed to update");
       return; // success
     } catch (err) {
       if (i === retries - 1) throw err;
       // wait before retry 
       await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
     }
  }
};
