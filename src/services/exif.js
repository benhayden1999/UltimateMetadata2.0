import { Metadata } from "../utils/metadata.js";
import pkg from "exiftool-vendored";
const { exiftool } = pkg;

const modifyMetadata = async (ctx, filePath, file_size) => {
  const coords = ctx.user.gpsCoords;
  try {
    const metadata = new Metadata(coords, file_size).generateMetadata();
    await exiftool.write(filePath, metadata);
    return metadata;
  } catch (error) {
    throw new Error("Failed to modify metadata");
  }
};

export { modifyMetadata };
