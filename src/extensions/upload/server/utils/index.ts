export const getService = (name) => {
  return strapi.plugin("upload").service(name);
};
