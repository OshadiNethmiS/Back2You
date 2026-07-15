const Item = require('../models/Item');

/**
 * Simple text similarity checker (title/location match karanna).
 * exact match, substring match, nathnam word-overlap check karanawa.
 * String-similarity wage npm package ekakin mekata wada accurate karanna puluwan.
 */
function isSimilarText(text1 = '', text2 = '') {
  const clean = (t) => t.toLowerCase().trim();
  const a = clean(text1);
  const b = clean(text2);

  if (!a || !b) return false;
  if (a === b || a.includes(b) || b.includes(a)) return true;

  const wordsA = a.split(/\s+/);
  const wordsB = b.split(/\s+/);
  const commonWords = wordsA.filter((w) => wordsB.includes(w) && w.length > 2);

  return commonWords.length > 0;
}

/**
 * New item ekakata (lost hari found hari) gälapena opposite-type items
 * find karanawa.
 *
 * item.date eka schema eke String widihata thiyena nisa, hærama Date
 * object ekakata convert karala compare karanawa.
 *
 * Date window eka: [itemDate - 3 days, itemDate + 2 days]
 *  - kavuruhari item eka hamba karala dawas 3kata kalin post karala thibbath
 *  - nathnam hamba unath item eka lost una dawasata passe dawas 2ak athulath
 *    post karala thibbath, dekama window ekata athulath wenawa.
 */
async function findMatchesForItem(item) {
  const oppositeType = item.type === 'lost' ? 'found' : 'lost';

  const itemDate = new Date(item.date);
  const windowStart = new Date(itemDate);
  windowStart.setDate(windowStart.getDate() - 3);
  const windowEnd = new Date(itemDate);
  windowEnd.setDate(windowEnd.getDate() + 2);

  // 1st pass: DB level filter — opposite type + same category (cheap, narrows results down)
  const candidates = await Item.find({
    type: oppositeType,
    category: item.category,
    _id: { $ne: item._id }
  }).populate('postedBy', 'name email');

  // 2nd pass: application level filter — date window + title + location similarity
  const matches = candidates.filter((candidate) => {
    const candidateDate = new Date(candidate.date);
    const withinWindow = candidateDate >= windowStart && candidateDate <= windowEnd;
    const titleMatches = isSimilarText(item.title, candidate.title);
    const locationMatches = isSimilarText(item.location, candidate.location);
    return withinWindow && titleMatches && locationMatches;
  });

  return matches;
}

module.exports = { findMatchesForItem, isSimilarText };
