const cron = require("node-cron");
const { Op } = require("sequelize");
const { Bid, InfluencerDay, User, Profile, Certification, Course, Licence } = require("../models");
const sendEmail = require("../utils/sendEmail");

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
}

/**
 * Deduct the winning bid amount from the user's sponsorship pool.
 * Spreads the deduction across certifications, courses, and licences
 * (largest sponsorship first) until the full amount is consumed.
 */
async function deductSponsorship(userId, bidAmount) {
  let remaining = parseFloat(bidAmount);

  // Gather all sponsored items, sorted by sponsorship_amount DESC
  const certs = await Certification.findAll({
    where: { user_id: userId, sponsorship_amount: { [Op.gt]: 0 } },
    order: [["sponsorship_amount", "DESC"]]
  });
  const courses = await Course.findAll({
    where: { user_id: userId, sponsorship_amount: { [Op.gt]: 0 } },
    order: [["sponsorship_amount", "DESC"]]
  });
  const licences = await Licence.findAll({
    where: { user_id: userId, sponsorship_amount: { [Op.gt]: 0 } },
    order: [["sponsorship_amount", "DESC"]]
  });

  // Merge all items into one list sorted by amount DESC
  const allItems = [...certs, ...courses, ...licences].sort(
    (a, b) => parseFloat(b.sponsorship_amount) - parseFloat(a.sponsorship_amount)
  );

  for (const item of allItems) {
    if (remaining <= 0) break;

    const current = parseFloat(item.sponsorship_amount);
    const deduction = Math.min(current, remaining);

    await item.update({ sponsorship_amount: (current - deduction).toFixed(2) });
    remaining -= deduction;
  }

  console.log(`Sponsorship deducted: £${bidAmount} from user ${userId}. Remainder: £${remaining.toFixed(2)}`);
}


const selectWinner = async () => {
  try {
    console.log("Running automated winner selection...");

    const today = getTodayDate();
    const tomorrow = getTomorrowDate();
    
    // Calculate month range for the slot date (tomorrow)
    const slotDate = new Date(tomorrow);
    const start = new Date(slotDate.getFullYear(), slotDate.getMonth(), 1).toISOString().split("T")[0];
    const end = new Date(slotDate.getFullYear(), slotDate.getMonth() + 1, 0).toISOString().split("T")[0];

    // get all valid bids for tomorrow slot, highest first
    const bids = await Bid.findAll({
      where: {
        slot_date: tomorrow,
        cancelled: false
      },
      order: [["bid_amount", "DESC"]]
    });

    if (!bids.length) {
      console.log("No bids found for tomorrow slot.");
      return;
    }

    let selectedWinner = null;

    // diversity rule:
    // max 3 wins per month
    // if attended_event = true, allow 4th win
    for (const bid of bids) {
      const user = await User.findByPk(bid.user_id);

      if (!user) {
        continue;
      }

      const winCount = await InfluencerDay.count({
        where: {
          user_id: bid.user_id,
          active_date: {
            [Op.between]: [start, end]
          }
        }
      });

      const maxWins = user.attended_event ? 4 : 3;

      if (winCount < maxWins) {
        selectedWinner = bid;
        break;
      }
    }

    if (!selectedWinner) {
      console.log("No eligible winner found due to diversity limit.");
      return;
    }

    // mark all bids for tomorrow as LOST except winner
    await Bid.update(
      { status: "LOST" },
      {
        where: {
          slot_date: tomorrow,
          cancelled: false,
          id: {
            [Op.ne]: selectedWinner.id
          }
        }
      }
    );

    // mark selected bid as WON
    await selectedWinner.update({
      status: "WON"
    });

    // deduct winning bid amount from the winner's sponsorship pool
    await deductSponsorship(selectedWinner.user_id, selectedWinner.bid_amount);

    // Count total wins for this user (lifetime appearance count)
    const totalWins = await InfluencerDay.count({
      where: { user_id: selectedWinner.user_id }
    });

    // create/update influencer of the day for tomorrow
    const existingInfluencer = await InfluencerDay.findOne({
      where: { active_date: tomorrow }
    });

    if (existingInfluencer) {
      await existingInfluencer.update({
        user_id: selectedWinner.user_id,
        appearance_count: totalWins + 1,
        is_active: true
      });
    } else {
      await InfluencerDay.create({
        user_id: selectedWinner.user_id,
        active_date: tomorrow,
        appearance_count: totalWins + 1,
        is_active: true
      });
    }

    console.log(
      `Winner selected successfully. Bid ID: ${selectedWinner.id}, User ID: ${selectedWinner.user_id}`
    );

    // send email notification
    const winnerUser = await User.findByPk(selectedWinner.user_id);
    const winnerProfile = await Profile.findOne({
      where: { user_id: selectedWinner.user_id }
    });

    if (winnerUser) {
      try {
        await sendEmail(
          winnerUser.email,
          "🎉 You are Influencer of the Day!",
          `
            <h2>Congratulations${winnerProfile?.full_name ? `, ${winnerProfile.full_name}` : ""}!</h2>
            <p>You have been selected as <strong>Alumni Influencer of the Day</strong>.</p>
            <p><strong>Winning bid amount:</strong> ${selectedWinner.bid_amount}</p>
            <p><strong>Active date:</strong> ${today}</p>
            <br />
            <p>Keep inspiring others 🚀</p>
          `
        );

        console.log(`Winner notification email sent to ${winnerUser.email}`);
      } catch (mailErr) {
        console.error("Failed to send winner email:", mailErr.message);
      }
    }
  } catch (err) {
    console.error("Scheduler error:", err);
  }
};

// run automatically every day at 6 PM
cron.schedule("0 18 * * *", async () => {
  await selectWinner();
});

module.exports = selectWinner;