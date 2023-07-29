import crypto from "crypto";

const encrypt = (queryString) => {
  const hash = crypto.createHash("sha512");
  return hash.update(queryString, "utf-8").digest("hex");
};

export { encrypt };
