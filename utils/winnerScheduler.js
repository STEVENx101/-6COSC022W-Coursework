const cron = require("node-cron");
const { Op } = require("sequelize");
const { Bid, InfluencerDay, User, Profile } = require("../models");
const sendEmail = require("../utils/sendEmail");

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
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

    // create/update influencer of the day for tomorrow
    const existingInfluencer = await InfluencerDay.findOne({
      where: { active_date: tomorrow }
    });

    if (existingInfluencer) {
      await existingInfluencer.update({
        user_id: selectedWinner.user_id,
        appearance_count: 0,
        is_active: true
      });
    } else {
      await InfluencerDay.create({
        user_id: selectedWinner.user_id,
        active_date: tomorrow,
        appearance_count: 0,
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