const express = require("express");
const passport = require("passport");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const passportSteam = require("passport-steam");
const SteamStrategy = passportSteam.Strategy;
const mysql = require("mysql");
const path = require("path");
const sql = require("./sql.js")

// load configuration files
const config = require("./config.json");
config.SUBDIR = "/";
const lang = require(`./lang/${config.lang}.json`);

const app = new express();

const PORT = config.PORT;

let returnURL = `${config.PROTOCOL}://${config.HOST}${config.SUBDIR}api/auth/steam/return`;
let realm = `${config.PROTOCOL}://${config.HOST}${config.SUBDIR}`;

if (config.HOST == "localhost" || config.HOST == "127.0.0.1") {
  returnURL = `${config.PROTOCOL}://${config.HOST}:${config.PORT}${config.SUBDIR}api/auth/steam/return`;
  realm = `${config.PROTOCOL}://${config.HOST}:${config.PORT}${config.SUBDIR}`;
}

if (config.proxy) {
  console.log("Using proxy: " + config.proxy);
  // set proxy for http and https requests
  process.env.HTTP_PROXY = config.proxy;
  process.env.HTTPS_PROXY = config.proxy;
}

// connect to db
const connection = mysql.createConnection({
  host: config.DB.DB_HOST,
  user: config.DB.DB_USER,
  database: config.DB.DB_DB,
  password: config.DB.DB_PASS,
  port: config.DB.DB_PORT,
});
connection.connect(function (err) {
  if (err) {
    return console.error("Error: " + err.message);
  } else {
    console.log("Connected to MySQL!");
  }
});

// heartbeat for db
setInterval(() => {
  connection.query("SELECT 1", (err, res, fields) => {});
}, 10000);

sql.setConnection(connection);

// generate random secret if not set
randomSecret = () => {
  // crypto
  const crypto = require("crypto");
  return crypto.randomBytes(32).toString("hex");
};

app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");
app.use(express.static("src/public"));

const fileStoreOptions = { logFn: function () {} };

// Required to get data from user for sessions
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});
// Initiate Strategy
passport.use(
  new SteamStrategy(
    {
      returnURL: returnURL,
      realm: realm,
      apiKey: config.STEAMAPIKEY,
    },
    function (identifier, profile, done) {
      process.nextTick(function () {
        profile.identifier = identifier;
        return done(null, profile);
      });
    }
  )
);
app.use(
  session({
    store: new FileStore(fileStoreOptions),
    secret: config.secret ? config.secret : randomSecret(),
    saveUninitialized: true,
    resave: false,
    cookie: {
      maxAge: 3600000,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get(config.SUBDIR, (req, res) => {
  if (typeof req.user != "undefined") {
    try {
      connection.query(
        "SELECT * FROM wp_player_knife WHERE steamid = ?",
        [req.user.id],
        (err, results, fields) => {
          connection.query(
            "SELECT * FROM wp_player_skins WHERE steamid = ?",
            [req.user.id],
            (err, results2, fields) => {
              connection.query(
                "SELECT * FROM wp_player_agents WHERE steamid = ?",
                [req.user.id],
                (err, results3, fields) => {
                  connection.query(
                    "SELECT * FROM wp_player_music WHERE steamid = ?",
                    [req.user.id],
                    (err, results4, fields) => {
                      connection.query(
                        "SELECT * FROM wp_player_gloves WHERE steamid = ?",
                        [req.user.id],
                        (err, results5, fields) => {
                          results = results !=undefined ? results : [];
                          results2 = results2 !=undefined ? results2 : [];
                          results3 = results3 !=undefined ? results3 : [];
                          results4 = results4 !=undefined ? results4 : [];
                          results5 = results5 !=undefined ? results5 : [];
                          res.render("index", {
                            config: config,
                            session: req.session,
                            user: req.user,
                            knife: results,
                            skins: results2,
                            agents: results3[0],
                            musics: results4,
                            gloves: results5,
                            lang: lang,
                            subdir: config.SUBDIR,
                          });
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    } catch (e) {
      console.log(e);
    }
  } else {
    res.render("index", {
      config: config,
      session: req.session,
      user: req.user,
      lang: lang,
      subdir: config.SUBDIR,
    });
  }
});

app.get(
  `${config.SUBDIR}api/auth/steam`,
  passport.authenticate("steam", { failureRedirect: config.SUBDIR }),
  function (req, res) {
    res.redirect("/");
  }
);

app.get(
  `${config.SUBDIR}api/auth/steam/return`,
  passport.authenticate("steam", { failureRedirect: config.SUBDIR }),
  function (req, res) {
    res.redirect("/");
  }
);

app.get(`${config.SUBDIR}api/logout`, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destruction error", err);
      return res.status(500).send("Session destruction failed.");
    }

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
    res.setHeader("Pragma", "no-cache"); // HTTP 1.0.
    res.setHeader("Expires", "0"); // Proxies.

    res.redirect("/");
  });
});

app.get("/api/delete", (req, res) => {
  connection.query(
    "DELETE FROM wp_player_knife WHERE steamid = ?",
    [req.user.id],
    (err, results, fields) => {
      connection.query(
        "DELETE FROM wp_player_skins WHERE steamid = ?",
        [req.user.id],
        (err, results, fields) => {
          req.session.destroy((err) => {
            res.redirect("/");
          });
        }
      );
    }
  );
});

// do right redirect
if (config.SUBDIR != "/") {
  app.get("/", (req, res) => {
    res.redirect(config.SUBDIR.slice(0, -1));
  });
}

// start server
const server = app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`);
});

// initialize socket.io
const io = require("socket.io")(server);

io.on("connection", (socket) => {
  console.log("Socket connected");

  socket.on("change-knife", (data) => {
    if (data.all) {
      sql.kinfe.updateKinfe(data.steamid, data.weaponid, 2).then(result => {
        return sql.kinfe.updateKinfe(data.steamid, data.weaponid, 3);
      }).then(result => {
        socket.emit("knife-changed", { knife: data.weaponid, all: true });
      });
    } else {
      sql.kinfe.updateKinfe(data.steamid, data.weaponid, data.team).then(result => {
        socket.emit("knife-changed", { knife: data.weaponid, team: data.team });
      });
    }
  });

  socket.on("change-glove", (data) => {
    if (data.all) {
      sql.glove.updateGlove(data.weaponid, data.steamid, 2).then(result => {
        return sql.glove.updateGlove(data.weaponid, data.steamid, 3);
      }).then(result => {
        socket.emit("glove-changed", { knife: data.weaponid, all: true });
      });
    } else {
      sql.glove.updateGlove(data.weaponid, data.steamid, data.team).then(result => {
        socket.emit("glove-changed", { knife: data.weaponid, team: data.team });
      });
    }
  });

  socket.on("change-music", (data) => {
    if (data.all) {
      sql.music.updateMusic(data.id, data.steamid, 2).then(result => {
        return sql.music.updateMusic(data.id, data.steamid, 3);
      }).then(result => {
        socket.emit("music-changed", { music: data.id, all: true });
      });
    } else {
      sql.music.updateMusic(data.id, data.steamid, data.team).then(result => {
        socket.emit("music-changed", { music: data.id, team: data.team });
      });
    }
  });

  socket.on("change-skin", (data) => {
    if (data.all) {
      sql.skin.updateSkin(data.steamid, data.weaponid, data.paintid, 2).then(result => {
        return sql.skin.updateSkin(data.steamid, data.weaponid, data.paintid, 3);
      }).then(result => {
        socket.emit("skin-changed", {
          weaponid: data.weaponid,
          paintid: data.paintid,
          newSkins: result,
          all: true
        });
      });
    } else {
      sql.skin.updateSkin(data.steamid, data.weaponid, data.paintid, data.team).then(result => {
        socket.emit("skin-changed", {
          weaponid: data.weaponid,
          paintid: data.paintid,
          newSkins: result,
          team: data.team
        });
      });
    }
  });

  socket.on("change-agent", (data) => {
    if (data.all) {
      sql.agent.updateAgent(data.model, data.steamid, 2).then(result => {
        return sql.agent.updateAgent(data.model, data.steamid, 3);
      }).then(result => {
        socket.emit("agent-changed", {
          agents: result,
          currentAgent: data.model,
          all: true
        });
      });
    } else {
      sql.agent.updateAgent(data.model, data.steamid, data.team).then(result => {
        socket.emit("agent-changed", {
          agents: result,
          currentAgent: data.model,
          team: data.team
        });
      });
    }
  });

  socket.on("change-params", (data) => {
    connection.query(
      "UPDATE wp_player_skins SET weapon_wear = ?, weapon_seed = ? WHERE steamid = ? AND weapon_defindex = ? AND weapon_paint_id = ?",
      [data.float, data.pattern, data.steamid, data.weaponid, data.paintid],
      (err, results, fields) => {
        socket.emit("params-changed");
      }
    );
  });

  socket.on("reset-skin", (data) => {
    connection.query(
      "DELETE FROM wp_player_skins WHERE steamid = ? AND weapon_defindex = ?",
      [data.steamid, data.weaponid],
      (err, results, fields) => {
        socket.emit("skin-reset", { weaponid: data.weaponid });
      }
    );
  });
});
