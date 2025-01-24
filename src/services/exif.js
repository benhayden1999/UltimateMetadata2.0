import { ExifTool } from "exiftool-vendored";
import { Metadata } from "../utils/metadata.js";

const modifyMetadata = async (ctx, filePath) => {
  const coords = ctx.user.gpsCoords;
  console.log(coords);
};

export { modifyMetadata };
