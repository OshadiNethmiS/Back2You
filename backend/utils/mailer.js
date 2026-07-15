const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ── Verify connection on startup so we know immediately if Gmail auth is broken ──
transporter.verify((err, success) => {
  if (err) {
    console.error('❌ MAILER CONFIG ERROR — emails will NOT send:', err.message);
  } else {
    console.log('✅ Mailer ready:', process.env.EMAIL_USER);
  }
});

const sendClaimEmails = async ({ item, claimant, owner }) => {
  // ── Debug log: shows exactly who claimed what, every time ──
  console.log('📨 Preparing claim emails —', {
    item: item?.title,
    claimant: { name: claimant?.name, email: claimant?.email, id: claimant?._id?.toString() },
    owner: owner ? { name: owner.name, email: owner.email } : 'No owner found',
    sendingTo: { admin: process.env.ADMIN_EMAIL, owner: owner?.email || 'N/A' }
  });

  const itemLink = `${process.env.ADMIN_PANEL_URL}/items/${item._id}`;

  // ── Email to Admin ──────────────────────────
  const adminMail = {
    from: `"Back2You" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `New Claim Submitted: ${item.title}`,
    html: `
      <h2>New Claim Submitted</h2>
      <p><b>Item:</b> ${item.title} (${item.category})</p>
      <p><b>Location:</b> ${item.location}</p>
      <p><b>Claimed by:</b> ${claimant.name} (${claimant.email})</p>
      <p><b>Original Poster:</b> ${owner ? owner.name : 'Unknown'} (${owner ? owner.email : 'N/A'})</p>
      <p>Please review and verify this claim in the admin panel.</p>
      <p><a href="${itemLink}">View Item</a></p>
    `
  };

  // ── Email to Owner (person who originally posted the item) ──
  const ownerMailPromise = owner
    ? transporter.sendMail({
        from: `"Back2You" <${process.env.EMAIL_USER}>`,
        to: owner.email,
        subject: `Someone claimed your item: ${item.title}`,
        html: `
          <h2>Your item has a claim request</h2>
          <p>Hi ${owner.name},</p>
          <p><b>${claimant.name}</b> has submitted a claim for your item "<b>${item.title}</b>".</p>
          <p>Our admin team will review the claim and contact you for verification before any details are shared.</p>
        `
      })
    : Promise.resolve();

  const [adminResult, ownerResult] = await Promise.allSettled([
    transporter.sendMail(adminMail),
    ownerMailPromise
  ]);

  if (adminResult.status === 'fulfilled') {
    console.log('✅ Admin email sent:', adminResult.value.response);
  } else {
    console.error('❌ Admin email FAILED:', adminResult.reason.message);
  }

  if (owner) {
    if (ownerResult.status === 'fulfilled') {
      console.log('✅ Owner email sent to', owner.email, ':', ownerResult.value.response);
    } else {
      console.error('❌ Owner email FAILED:', ownerResult.reason.message);
    }
  } else {
    console.log('ℹ️ No owner email sent — item has no postedBy/owner.');
  }
};

// ══════════════════════════════════════════════
// sendMatchEmails — new item ekakata (lost/found) possible match
// hambunama, admin ta saha item eka post kala kenata email yawanawa.
// ══════════════════════════════════════════════
const sendMatchEmails = async ({ newItem, matches, poster }) => {
  console.log('📨 Preparing match emails —', {
    newItem: newItem?.title,
    matchesFound: matches.length,
    poster: poster ? { name: poster.name, email: poster.email } : 'No poster found'
  });

  const itemLink = `${process.env.ADMIN_PANEL_URL}/items/${newItem._id}`;

  const matchListHtml = matches
    .map(
      (m) => `
        <li>
          <b>${m.title}</b> (${m.category}) - ${m.location}<br/>
          Date: ${m.date} | Posted by: ${m.postedBy ? m.postedBy.name : 'Unknown'} (${
        m.postedBy ? m.postedBy.email : 'N/A'
      })
        </li>`
    )
    .join('');

  // ── Email to Admin ──────────────────────────
  const adminMail = {
    from: `"Back2You" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `Possible Match Found: ${newItem.title}`,
    html: `
      <h2>Possible Match Detected</h2>
      <p><b>New ${newItem.type} item:</b> ${newItem.title} (${newItem.category})</p>
      <p><b>Location:</b> ${newItem.location} | <b>Date:</b> ${newItem.date}</p>
      <p><b>Possible matches:</b></p>
      <ul>${matchListHtml}</ul>
      <p><a href="${itemLink}">View Item</a></p>
    `
  };

  // ── Email to the person who posted the new item ──
  const posterMailPromise = poster
    ? transporter.sendMail({
        from: `"Back2You" <${process.env.EMAIL_USER}>`,
        to: poster.email,
        subject: `Possible match found for your ${newItem.type} item: ${newItem.title}`,
        html: `
          <h2>We found a possible match!</h2>
          <p>Hi ${poster.name},</p>
          <p>We found ${matches.length} item(s) that might match your ${newItem.type} item "<b>${newItem.title}</b>":</p>
          <ul>${matchListHtml}</ul>
          <p>Our admin team will verify this before any contact details are shared.</p>
        `
      })
    : Promise.resolve();

  const [adminResult, posterResult] = await Promise.allSettled([
    transporter.sendMail(adminMail),
    posterMailPromise
  ]);

  if (adminResult.status === 'fulfilled') {
    console.log('✅ Admin match email sent:', adminResult.value.response);
  } else {
    console.error('❌ Admin match email FAILED:', adminResult.reason.message);
  }

  if (poster) {
    if (posterResult.status === 'fulfilled') {
      console.log('✅ Poster match email sent to', poster.email, ':', posterResult.value.response);
    } else {
      console.error('❌ Poster match email FAILED:', posterResult.reason.message);
    }
  } else {
    console.log('ℹ️ No poster email sent — item has no postedBy/poster.');
  }
};

module.exports = { sendClaimEmails, sendMatchEmails };
