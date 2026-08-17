const mongoose = require('mongoose');

const questSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Quest title is required'],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'easy',
    },
    xpValue: {
      type: Number,
      default: 10,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Auto-assign XP based on difficulty prior to saving
questSchema.pre('save', function (next) {
  const xpMap = { easy: 10, medium: 25, hard: 50 };
  this.xpValue = xpMap[this.difficulty] || 10;
  next();
});

module.exports = mongoose.model('Quest', questSchema);