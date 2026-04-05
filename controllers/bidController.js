const { Op } = require("sequelize");
const { Bid } = require("../models");

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

exports.createBid = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bid_amount, bid_date, slot_date } = req.body;

    if (!bid_amount || !bid_date) {
      return res.status(400).json({
        message: "bid_amount and bid_date are required"
      });
    }

    const { start, end } = getMonthRange();

    const monthlyCount = await Bid.count({
      where: {
        user_id: userId,
        cancelled: false,
        bid_date: {
          [Op.between]: [start, end]
        }
      }
    });

    if (monthlyCount >= 3) {
      return res.status(400).json({
        message: "Monthly bid limit reached (3/3)"
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

    res.json(bids);
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

    if (bid_amount !== undefined && Number(bid_amount) < Number(bid.bid_amount)) {
      return res.status(400).json({
        message: "Bid amount cannot be decreased"
      });
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
      bids
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

    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.getMonthlyLimitStatus = async (req, res) => {
  try {
    const { start, end } = getMonthRange();

    const count = await Bid.count({
      where: {
        user_id: req.user.id,
        cancelled: false,
        bid_date: {
          [Op.between]: [start, end]
        }
      }
    });

    res.json({
      used: count,
      limit: 3,
      remaining: Math.max(0, 3 - count),
      reached: count >= 3,
      month_start: start,
      month_end: end
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};