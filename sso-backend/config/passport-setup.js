// passport.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GithubStrategy = require("passport-github2").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const User = require('../models/User');

async function findOrUpsertUser(profile, provider) {
  const providerId = String(profile.id);
  const photoUrl =
    profile.photos?.[0]?.value ||
    "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const filter = { provider, provider_id: providerId };
  const updates = {
    provider_id: providerId,
    email: profile.emails?.[0]?.value || null,
    name:
      profile.displayName ||
      profile.username ||
      profile.emails?.[0]?.value ||
      "Người dùng mới",
    avatar_url: photoUrl,
    last_login: new Date(),
  };

  const user = await User.findOneAndUpdate(
    filter,
    { $set: updates, $setOnInsert: { provider } },
    { new: true, upsert: true }
  );

  return user;
}

// --- Google OAuth ---
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        `${process.env.BACKEND_URL || "http://localhost:8080"}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("✅ CODE EXCHANGE GOOGLE THÀNH CÔNG!");
        const user = await findOrUpsertUser(profile, "google");
        return done(null, {
          uniqueId: `mongo:${user._id.toString()}`,
          id: user._id.toString(),
          displayName: user.name,
          email: user.email,
          provider: user.provider,
          photo: user.avatar_url,
        });
      } catch (err) {
        return done(err);
      }
    }
  )
);

// --- GitHub OAuth ---
passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL:
        `${process.env.BACKEND_URL || "http://localhost:8080"}/auth/github/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("✅ CODE EXCHANGE GITHUB THÀNH CÔNG!");
        const user = await findOrUpsertUser(profile, "github");
        return done(null, {
          uniqueId: `mongo:${user._id.toString()}`,
          id: user._id.toString(),
          displayName: user.name,
          email: user.email,
          provider: user.provider,
          photo: user.avatar_url,
        });
      } catch (err) {
        return done(err);
      }
    }
  )
);

// --- JWT Strategy ---
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (jwt_payload, done) => {
      try {
        const sub = String(jwt_payload.sub || "");
        if (!sub.startsWith('mongo:')) return done(null, false);
        const mongoId = sub.replace('mongo:', '');
        const user = await User.findById(mongoId).lean();
        if (!user) return done(null, false);
        return done(null, {
          uniqueId: `mongo:${user._id.toString()}`,
          id: user._id.toString(),
          displayName: user.name,
          email: user.email,
          provider: user.provider,
          photo: user.avatar_url,
        });
      } catch (err) {
        return done(err);
      }
    }
  )
);
module.exports = { passport };
