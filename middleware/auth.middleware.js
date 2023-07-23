const jsonwebtoken = require("jsonwebtoken");
const User = require("../models/user.models");

const checkAdmin = (req, res, next) => {
  if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
    jsonwebtoken.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ errorMessage: err.message });
      }
      if (decodedToken.role !== 'admin') {
        return res.status(401).json({ errorMessage: "Access Denied. You need Admin role access." });
      }
      User.findById(decodedToken.id).then((user) => {
        res.locals.user = user;
        next();
      }).catch((err) => {
        return res.status(500).json({ errorMessage: err.message })
      })
    }
    )
  } else {
    return res.status(403).json({ errorMessage: "Access denied." });
    // next();
  }
}

const checkLecturer = (req, res, next) => {
  if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
    jsonwebtoken.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ errorMessage: err.message });
      }
      if (decodedToken.role !== 'lecturer') {
        return res.status(401).json({ errorMessage: "Access Denied. You need lecturer role access." });
      }
      User.findById(decodedToken.id).then((user) => {
        res.locals.user = user;
        next();
      }).catch((err) => {
        return res.status(500).json({ errorMessage: err.message })
      })
    }
    )
  } else {
    return res.status(403).json({ errorMessage: "Access denied." });
    // next();
  }
}

const checkStudent = (req, res, next) => {
  if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
    jsonwebtoken.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ errorMessage: err.message });
      }
      if (decodedToken.role !== 'student') {
        return res.status(401).json({ errorMessage: "Access Denied. You need Student role access." });
      }
      User.findById(decodedToken.id).then((user) => {
        res.locals.user = user;
        next();
      }).catch((err) => {
        return res.status(500).json({ errorMessage: err.message })
      })
    }
    )
  } else {
    return res.status(403).json({ errorMessage: "Access denied." });
    // next();
  }
}


module.exports = { checkAdmin, checkLecturer, checkStudent };
