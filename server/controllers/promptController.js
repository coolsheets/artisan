const Prompt = require('../models/Prompt');

exports.createPrompt = async (req, res) => {
  try {
    const { original, optimized, atomized } = req.body;
    const prompt = new Prompt({ original, optimized, atomized });
    await prompt.save();
    res.status(201).json(prompt);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getPrompts = async (req, res) => {
  try {
    const prompts = await Prompt.find().sort({ createdAt: -1 });
    res.json(prompts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
