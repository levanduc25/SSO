// passport.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GithubStrategy = require("passport-github2").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const users = {}; // bộ nhớ tạm (demo)

const findOrCreateUser = (profile, provider) => {
  const uniqueId = `${provider}:${profile.id}`;
  if (users[uniqueId]) return users[uniqueId];

  const photoUrl =
    profile.photos?.[0]?.value ||
    "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const newUser = {
    uniqueId,
    id: profile.id,
    displayName:
      profile.displayName ||
      profile.username ||
      profile.emails?.[0]?.value ||
      "Người dùng mới",
    email: profile.emails?.[0]?.value || null,
    provider,
    photo: photoUrl,
  };

  users[uniqueId] = newUser;
  return newUser;
};

// --- Google OAuth ---
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        `${process.env.BACKEND_URL || "http://localhost:8080"}/auth/google/callback`,
    },
    (accessToken, refreshToken, profile, done) => {
      console.log("✅ CODE EXCHANGE GOOGLE THÀNH CÔNG!");
      const user = findOrCreateUser(profile, "google");
      return done(null, user);
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
    (accessToken, refreshToken, profile, done) => {
      console.log("✅ CODE EXCHANGE GITHUB THÀNH CÔNG!");
      const user = findOrCreateUser(profile, "github");
      return done(null, user);
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
    (jwt_payload, done) => {
      const user = users[jwt_payload.sub];
      if (user) return done(null, user);
      return done(null, false);
    }
  )
);

module.exports = { passport, users };
