const BASE_URL = 'https://voodoo-sandbox.myshopify.com';

export const request = (url) => {
  return fetch(BASE_URL + url)
    .then(response => {
      if (!response.ok) {
        throw new Error();
      }

      return response.json();
    });
};
