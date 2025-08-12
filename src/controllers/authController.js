const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const bcrypt = require("bcrypt");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/tokens");

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite: "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ message: "Utilisateur déjà existant" });
    }

    const user = new User({ username, email, password });
    await user.save();

    res.status(201).json({ message: "Utilisateur créé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const accessToken = generateAccessToken(user);

    const refreshTokenPlain = generateRefreshToken();

    const saltRounds = 10;
    const hashedToken = await bcrypt.hash(refreshTokenPlain, saltRounds);

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 jours
    await RefreshToken.create({
      tokenHash: hashedToken,
      user: user._id,
      expiresAt,
    });

    res.cookie("refreshToken", refreshTokenPlain, COOKIE_OPTIONS);

    res.json({ accessToken });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

const refresh = async (req, res) => {
  try {
    const refreshTokenPlain = req.cookies.refreshToken;
    if (!refreshTokenPlain) {
      return res.status(401).json({ message: "Refresh token manquant" });
    }

    const tokens = await RefreshToken.find();
    let foundToken = null;

    for (const tokenDoc of tokens) {
      const match = await bcrypt.compare(refreshTokenPlain, tokenDoc.tokenHash);
      if (match) {
        foundToken = tokenDoc;
        break;
      }
    }

    if (!foundToken) {
      return res.status(403).json({ message: "Refresh token invalide" });
    }

    if (foundToken.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ _id: foundToken._id });
      return res.status(403).json({ message: "Refresh token expiré" });
    }

    const user = await User.findById(foundToken.user);
    if (!user) {
      return res.status(403).json({ message: "Utilisateur non trouvé" });
    }

    await RefreshToken.deleteOne({ _id: foundToken._id });

    const accessToken = generateAccessToken(user);
    const newRefreshTokenPlain = generateRefreshToken();
    const saltRounds = 10;
    const newHashedToken = await bcrypt.hash(newRefreshTokenPlain, saltRounds);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await RefreshToken.create({
      tokenHash: newHashedToken,
      user: user._id,
      expiresAt,
    });

    res.cookie("refreshToken", newRefreshTokenPlain, COOKIE_OPTIONS);

    res.json({ accessToken });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

const logout = async (req, res) => {
  try {
    const refreshTokenPlain = req.cookies.refreshToken;
    if (refreshTokenPlain) {
      const tokens = await RefreshToken.find();
      for (const tokenDoc of tokens) {
        const match = await bcrypt.compare(
          refreshTokenPlain,
          tokenDoc.tokenHash
        );
        if (match) {
          await RefreshToken.deleteOne({ _id: tokenDoc._id });
          break;
        }
      }
    }

    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    res.json({ message: "Déconnexion réussie" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
};
