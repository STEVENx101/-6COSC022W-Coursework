const { Certification } = require("../models");

exports.createCertification = async (req, res) => {
  try {
    const { title, organization, year } = req.body;

    const item = await Certification.create({
      user_id: req.user.id,
      title,
      organization,
      year
    });

    res.status(201).json({
      message: "Certification created successfully",
      item
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyCertifications = async (req, res) => {
  try {
    const items = await Certification.findAll({
      where: { user_id: req.user.id },
      order: [["id", "DESC"]]
    });

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateCertification = async (req, res) => {
  try {
    const item = await Certification.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!item) {
      return res.status(404).json({ message: "Certification not found" });
    }

    await item.update(req.body);

    res.json({
      message: "Certification updated successfully",
      item
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteCertification = async (req, res) => {
  try {
    const item = await Certification.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!item) {
      return res.status(404).json({ message: "Certification not found" });
    }

    await item.destroy();

    res.json({
      message: "Certification deleted successfully"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};