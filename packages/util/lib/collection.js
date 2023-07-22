/* eslint-disable unicorn/no-array-callback-reference, unicorn/no-array-method-this-argument */

/**
 * Get pagination cursor
 * @param {object} collection - Database collection
 * @param {Date} after - Items created after this date
 * @param {Date} before - Items created before this date
 * @param {number} limit - Number of items to return within cursor
 * @returns {Promise<object>} Pagination cursor
 */
export const getCursor = async (collection, after, before, limit) => {
  const cursor = {
    items: [],
    hasNext: false,
    hasPrev: false,
  };
  const query = {};
  const options = {
    limit: Number.parseInt(String(limit), 10) || 40,
    sort: { "properties.published": -1 },
  };

  if (before) {
    query["properties.published"] = { $gt: before };
    options.sort["properties.published"] = 1;
  } else if (after) {
    query["properties.published"] = { $lt: after };
  }

  const items = await collection.find(query, options).toArray();

  if (items.length > 0) {
    cursor.items = items;
    cursor.lastItem = items.at(-1).properties.published;
    cursor.firstItem = items[0].properties.published;
    cursor.hasNext = Boolean(
      await collection.findOne({
        "properties.published": { $lt: cursor.lastItem },
      })
    );
    cursor.hasPrev = Boolean(
      await collection.findOne({
        "properties.published": { $gt: cursor.firstItem },
      })
    );
  }

  return cursor;
};
