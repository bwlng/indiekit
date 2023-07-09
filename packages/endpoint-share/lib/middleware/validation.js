import { check } from "express-validator";

export const validate = [
  // Disable check for empty name for bookmarks
  // check("name")
  //   .notEmpty()
  //   .withMessage((value, { req, path }) => req.__(`share.error.${path}.empty`)),
  check("bookmark-of")
    .exists()
    .isURL()
    .withMessage((value, { req, path }) => req.__(`share.error.${path}.empty`)),
];
