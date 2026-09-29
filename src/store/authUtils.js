export const isTechProvider = (email = "") => {
  email = email.toLowerCase().trim();
  return (
    email === "pranjalvejani2111@gmail.com" ||
    email === "japan@jmstech.co" ||
    email.endsWith("@jmsadvisory.in")
  );
};

export const canViewClients = (email = "") => {
  email = email.toLowerCase().trim();
  return isTechProvider(email) && email !== "japan@jmstech.co";
};