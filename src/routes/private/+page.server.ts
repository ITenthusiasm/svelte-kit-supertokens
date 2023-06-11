import type { Actions } from "./$types";

export const actions: Actions = {
  async default(event) {
    const data = await event.request.formData().then(Object.fromEntries);
    return { success: true, data };
  },
};
