
export const getErrorMessage = (error: any): string => {
  if (error?.response?.data?.errors) {
    const errors = error.response.data.errors;
    const allMessages: string[] = [];

    Object.keys(errors).forEach((key) => {
      const fieldErrors = errors[key];
      if (Array.isArray(fieldErrors)) {
        allMessages.push(...fieldErrors);
      } else {
        allMessages.push(fieldErrors);
      }
    });

    const uniqueMessages = Array.from(new Set(allMessages));
    return uniqueMessages.join("\n");
  }

  if (error?.response?.data?.title) {
    return error.response.data.title;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  return error.message || "An unexpected error occurred.";
};
