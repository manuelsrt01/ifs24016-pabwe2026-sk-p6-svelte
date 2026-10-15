export async function runAction(flagStore, action) {
  flagStore.set(true);
  try {
    const response = await action();
    return { ok: true, message: response.message, data: response.data };
  } catch (error) {
    const details = Object.values(error.data ?? {}).flat().join(", ");
    return {
      ok: false,
      message: details ? `${error.message}: ${details}` : error.message,
      errors: error.data,
    };
  } finally {
    flagStore.set(false);
  }
}
