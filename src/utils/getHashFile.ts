import { createHash } from "crypto";
import { readFileSync } from "fs";

import { logRed } from "./logs";

const getHashFromFile = (fileName: string, showError = true) => {
  try {
    const fileBuffer = readFileSync(fileName);
    const hashSum = createHash("sha256");
    hashSum.update(fileBuffer);

    return hashSum.digest("hex");
  } catch (e) {
    if (showError) logRed(`File ${fileName} doesn't exist`);
    return null;
  }
};

export default getHashFromFile;
