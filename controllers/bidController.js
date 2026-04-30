const { Op } = require("sequelize");
const { Bid, Certification, Course, Licence, InfluencerDay } = require("../models");

function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
}

function getMonthRange() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const start = new Date(year, month, 1).toISOString().split("T")[0];
  const end = new Date(year, month + 1, 0).toISOString().split("T")[0];

  return { start, end };
}

async function getTotalSponsorship(userId) {
  const certs = await Certification.findAll({ where: { user_id: userId } });
  const courses = await Course.findAll({ where: { user_id: userId } });
  const licences = await Licence.findAll({ where: { user_id: userId } });
  
  const total = [...certs, ...courses, ...licences].reduce((sum, item) => sum + (parseFloat(item.sponsorship_amount) || 0), 0);
  return total;
}

exports.createBid = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bid_amount, bid_date, slot_date } = req.body;

    if (!bid_amount || !bid_date) {
      return res.status(400).json({
        message: "bid_amount and bid_date are required"
      });
    }

    // 1. Check Sponsored Amount Limit
    const totalSponsorship = await getTotalSponsorship(userId);
    if (parseFloat(bid_amount) > totalSponsorship) {
      return res.status(400).json({
        message: `Your bid (£${bid_amount}) exceeds your total sponsorship (£${totalSponsorship.toFixed(2)}). Offer more sponsorships first!`
      });
    }

    // 2. Check Frequency Limit (One active bid per day)
    const existingActiveBid = await Bid.findOne({
      where: {
        user_id: userId,
        cancelled: false,
        status: "PENDING",
        slot_date: slot_date || getTomorrowDate()
      }
    });

    if (existingActiveBid) {
      return res.status(400).json({
        message: "You already have an active pending bid for this day. You can only have one active bidding per day."
      });
    }

    const bid = await Bid.create({
      user_id: userId,
      bid_amount,
      bid_date,
      slot_date: slot_date || getTomorrowDate(),
      status: "PENDING",
      cancelled: false
    });

    res.status(201).json({
      message: "Bid created successfully",
      bid
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.getMyBids = async (req, res) => {
  try {
    const bids = await Bid.findAll({
      where: { user_id: req.user.id },
      order: [["id", "DESC"]]
    });

    // For each pending bid, check if it's the highest for its slot_date
    const enrichedBids = await Promise.all(bids.map(async (bid) => {
      const b = bid.toJSON();
      if (b.status === "PENDING" && !b.cancelled) {
        const highestBid = await Bid.findOne({
          where: {
            slot_date: b.slot_date,
            cancelled: false
          },
          order: [["bid_amount", "DESC"]]
        });
        
        b.competitive_status = (highestBid && highestBid.id === b.id) ? "Winning" : "Losing";
      }
      return b;
    }));

    res.json(enrichedBids);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.updateBid = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { bid_amount, status, bid_date, slot_date } = req.body;

    const bid = await Bid.findOne({
      where: {
        id,
        user_id: userId
      }
    });

    if (!bid) {
      return res.status(404).json({
        message: "Bid not found"
      });
    }

    if (bid.cancelled) {
      return res.status(400).json({
        message: "Cancelled bid cannot be updated"
      });
    }

    if (bid_amount !== undefined) {
      const totalSponsorship = await getTotalSponsorship(userId);
      if (Number(bid_amount) > totalSponsorship) {
        return res.status(400).json({
          message: `Your updated bid (£${bid_amount}) exceeds your total sponsorship (£${totalSponsorship.toFixed(2)})`
        });
      }
    }

    await bid.update({
      bid_amount: bid_amount !== undefined ? bid_amount : bid.bid_amount,
      status: status || bid.status,
      bid_date: bid_date || bid.bid_date,
      slot_date: slot_date || bid.slot_date
    });

    res.json({
      message: "Bid updated successfully",
      bid
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.cancelBid = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const bid = await Bid.findOne({
      where: {
        id,
        user_id: userId
      }
    });

    if (!bid) {
      return res.status(404).json({
        message: "Bid not found"
      });
    }

    if (bid.cancelled) {
      return res.status(400).json({
        message: "Bid already cancelled"
      });
    }

    if (bid.status === "WON" || bid.status === "LOST") {
      return res.status(400).json({
        message: "Completed bid cannot be cancelled"
      });
    }

    await bid.update({
      cancelled: true
    });

    res.json({
      message: "Bid cancelled successfully",
      bid
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.getTomorrowSlot = async (req, res) => {
  try {
    const tomorrow = getTomorrowDate();

    const bids = await Bid.findAll({
      where: {
        slot_date: tomorrow,
        cancelled: false
      },
      order: [["bid_amount", "DESC"]]
    });

    res.json({
      slot_date: tomorrow,
      totalBids: bids.length,
      bids: bids.map(bid => {
        const b = bid.toJSON();
        if (req.user && b.user_id !== req.user.id) {
          b.bid_amount = "£***";
        }
        return b;
      })
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.getBidHistory = async (req, res) => {
  try {
    const bids = await Bid.findAll({
      where: {
        user_id: req.user.id
      },
      order: [["id", "DESC"]]
    });

    res.json({
      total: bids.length,
      bids
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.getMyBidStatus = async (req, res) => {
  try {
    const bids = await Bid.findAll({
      where: {
        user_id: req.user.id
      },
      order: [["id", "DESC"]]
    });

    const summary = {
      total: bids.length,
      pending: bids.filter(b => b.status === "PENDING" && !b.cancelled).length,
      won: bids.filter(b => b.status === "WON").length,
      lost: bids.filter(b => b.status === "LOST").length,
      cancelled: bids.filter(b => b.cancelled).length
    };

    // Get total wins (appearance count)
    const totalWins = await InfluencerDay.count({
      where: { user_id: req.user.id }
    });

    // Get monthly wins
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
    const monthlyWins = await InfluencerDay.count({
      where: {
        user_id: req.user.id,
        active_date: { [Op.between]: [monthStart, monthEnd] }
      }
    });

    res.json({ ...summary, totalWins, monthlyWins });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.getMonthlyLimitStatus = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const count = await Bid.count({
      where: {
        user_id: req.user.id,
        cancelled: false,
        bid_date: today
      }
    });

    res.json({
      used: count,
      limit: 1,
      remaining: Math.max(0, 1 - count),
      reached: count >= 1,
      date: today
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.getPublicBids = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const bids = await Bid.findAll({
      where: {
        slot_date: today,
        cancelled: false
      },
      order: [["bid_amount", "DESC"]]
    });

    res.json({
      slot_date: today,
      totalBids: bids.length,
      bids: bids.map((bid, index) => ({
        id: index + 1,
        bid_amount: "£***",
        competitive_status: index === 0 ? "Highest Bid" : "Competitive",
        status: "ACTIVE"
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};