export const isTechProvider = (email = "") => {

  email = email.toLowerCase().trim();

  return (
    email === "pranjalvejani2111@gmail.com" ||
    email.endsWith("@jmsadvisory.in")
  );
};