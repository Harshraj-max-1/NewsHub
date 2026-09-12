const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name.trim();
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        interests: user.interests,
        preferredSources: user.preferredSources,
        theme: user.theme,
        onboardingCompleted: user.onboardingCompleted
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user preferences & onboarding
// @route   PUT /api/users/preferences
// @access  Private
exports.updatePreferences = async (req, res, next) => {
  try {
    const { interests, preferredSources, theme, defaultRegion, onboardingCompleted } = req.body;
    const user = await User.findById(req.user._id);

    if (Array.isArray(interests)) {
      user.interests = interests.map(i => i.toLowerCase().trim());
    }
    if (Array.isArray(preferredSources)) {
      user.preferredSources = preferredSources;
    }
    if (theme && ['light', 'dark', 'system'].includes(theme)) {
      user.theme = theme;
    }
    if (defaultRegion && ['india', 'global', 'all'].includes(defaultRegion)) {
      user.defaultRegion = defaultRegion;
    }
    if (typeof onboardingCompleted === 'boolean') {
      user.onboardingCompleted = onboardingCompleted;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Preferences updated',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        interests: user.interests,
        preferredSources: user.preferredSources,
        theme: user.theme,
        onboardingCompleted: user.onboardingCompleted
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/users/password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new passwords'
      });
    }

    const user = await User.findById(req.user._id).select('+passwordHash');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.passwordHash = await User.hashPassword(newPassword);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};
