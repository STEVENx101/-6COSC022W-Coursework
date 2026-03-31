const { Bid } = require("../models");

exports.createBid = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bid_amount, bid_date } = req.body;

    if (!bid_amount || !bid_date) {
      return res.status(400).json({
        message: "bid_amount and bid_date are required"
      });
    }

    const bid = await Bid.create({
      user_id: userId,
      bid_amount,
      bid_date,
      status: "PENDING"
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
    const userId = req.user.id;

    const bids = await Bid.findAll({
      where: { user_id: userId },
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
    const { bid_amount, status, bid_date } = req.body;

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

    if (bid_amount !== undefined && Number(bid_amount) < Number(bid.bid_amount)) {
      return res.status(400).json({
        message: "Bid amount cannot be decreased"
      });
    }

    await bid.update({
      bid_amount: bid_amount !== undefined ? bid_amount : bid.bid_amount,
      status: status || bid.status,
      bid_date: bid_date || bid.bid_date
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