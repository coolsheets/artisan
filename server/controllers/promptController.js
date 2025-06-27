const Prompt = require('../models/Prompt');

exports.createPrompt = async (req, res) => {
  const { original, optimized, atomized } = req.body;
  const prompt = new Prompt({ original, optimized, atomized });
  await prompt.save();
  res.status(201).json(prompt);
};

exports.getPrompts = async (req, res) => {
  const prompts = await Prompt.find().sort({ createdAt: -1 });
  res.json(prompts);
};
