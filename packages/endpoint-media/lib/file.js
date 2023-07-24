import { getDate, randomString } from "@indiekit/util";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import ExifParser from "exif-parser";

/**
 * Derive properties from file data
 * @param {object} timeZone - Application time zone
 * @param {object} file - Original file object
 * @returns {Promise<object>} File properties
 * @example fileData('brighton-pier.jpg') => {
 *   basename: 'ds48s',
 *   ext: '.jpg'
 *   filename: 'ds48s.jpg'
 *   originalname: 'brighton-pier.jpg',
 *   'content-type': image/jpeg,
 *   published: '2020-07-19T22:59:23.497Z',
 * }
 */
export const getFileProperties = async (timeZone, file) => {
  const basename = randomString(5)
    .replace(/-|_/, "0") // Don’t use common slug separator characters
    .toLowerCase();
  const { ext, mime } = await fileTypeFromBuffer(file.data);
  const published = getPublishedProperty(timeZone);

  return {
    basename,
    ext,
    filename: `${basename}.${ext}`,
    originalname: file.name,
    "content-type": mime,
    published,
  };
};

/**
 * Derive media type (and return equivalent IndieWeb post type)
 * @param {object} file - File object
 * @returns {Promise<string>} Post type ('photo', 'video' or 'audio')
 * @example getMediaType('brighton-pier.jpg') => 'photo'
 */
export const getMediaType = async (file) => {
  const { mime } = await fileTypeFromBuffer(file.data);
  const type = mime.split("/")[0];

  if (type === "image") {
    return "photo";
  }

  return type;
};

/**
 * Get published date
 * @param {object} timeZone - Publication time zone
 * @returns {string} ISO 8601 date
 */
export const getPublishedProperty = (timeZone) => {
  const dateString = new Date().toISOString();
  const property = getDate(timeZone, dateString);
  return property;
};

export const correctImageOrientation = async (file) => {
  try {
    const exifData = ExifParser.create(file.data).parse();
    const orientation = exifData.tags.Orientation;

    const image = sharp(file.data);

    if (orientation && orientation !== 1) {
      switch (orientation) {
        case 2: {
          image.flip();
          break;
        }
        case 3: {
          image.rotate(180);
          break;
        }
        case 4: {
          image.flop();
          break;
        }
        case 5: {
          image.flip().rotate(90);
          break;
        }
        case 6: {
          image.rotate(90);
          break;
        }
        case 7: {
          image.flip().rotate(270);
          break;
        }
        case 8: {
          image.rotate(270);
          break;
        }
        default: {
          break;
        }
      }
    }

    file.data = await image.toBuffer();

    return file;
  } catch {
    return file;
  }
};
