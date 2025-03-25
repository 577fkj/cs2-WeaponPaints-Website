let connection = null;

exports.setConnection = (c) => {
    connection = c;
}

function getKnifes(steamid, team) {
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT * FROM wp_player_knife WHERE steamid = ? AND weapon_team = ?",
            [steamid, team],
            (err, results, fields) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                }
                resolve(results);
            }
        );
    });
}
function setKinfe(steamid, weaponid, team) {
    return new Promise((resolve, reject) => {
        connection.query(
            "UPDATE wp_player_knife SET knife = ? WHERE steamid = ? AND weapon_team = ?",
            [weaponid, steamid, team],
            (err, results, fields) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                }
                resolve(results);
            }
        );
    });
}
function addKinfe(steamid, weaponid, team) {
    return new Promise((resolve, reject) => {
        connection.query(
            "INSERT INTO wp_player_knife (steamid, weapon_team, knife) values (?, ?, ?)",
            [steamid, team, weaponid],
            (err, results, fields) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                }
                resolve(results);
            }
          );
    });
}
function updateKinfe(steamid, weaponid, team) {
    return getKnifes(steamid, team).then(knifes => {
        if (knifes.length > 0) {
            return setKinfe(steamid, weaponid, team);
        } else {
            return addKinfe(steamid, weaponid, team);
        }
    });
}

exports.kinfe = {
    getKnifes,
    addKinfe,
    updateKinfe
}

function getGloves(steamid, team) {
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT * FROM wp_player_gloves WHERE steamid = ? AND weapon_team = ?",
            [steamid, team],
            (err, results, fields) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                }
                resolve(results);
            }
        )
    });
}

function setGlove(weaponid, steamid, team) {
    return new Promise((resolve, reject) => {
        connection.query(
            "UPDATE wp_player_gloves SET weapon_defindex = ? WHERE steamid = ? AND weapon_team = ?",
            [weaponid, steamid, team],
            (err, results, fields) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                }
                resolve(results);
            }
        );
    });
}

function addGlove(weaponid, steamid, team) {
    return new Promise((resolve, reject) => {
        connection.query(
            "INSERT INTO wp_player_gloves (steamid, weapon_defindex, weapon_team) values (?, ?, ?)",
            [steamid, weaponid, team],
            (err, results, fields) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                }
                resolve(results);
            }
        );
    });
}

function updateGlove(weaponid, steamid, team) {
    return getGloves(steamid, team).then(gloves => {
        if (gloves.length > 0) {
            return setGlove(weaponid, steamid, team);
        } else {
            return addGlove(weaponid, steamid, team);
        }
    })
}

exports.glove = {
    getGloves,
    setGlove,
    updateGlove
}

function getMusics(steamid, team) {
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT * FROM wp_player_music WHERE steamid = ? AND weapon_team = ?",
            [steamid, team],
            (err, results, fields) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                }
                resolve(results);
            }
        );
    });
}

function setMusic(id, steamid, team) {
    return new Promise((resolve, reject) => {
        connection.query(
            "UPDATE wp_player_music SET music_id = ? WHERE steamid = ? AND weapon_team = ?",
            [id, steamid, team],
            (err, results, fields) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                }
                resolve(results);
            }
          );
    });
}

function addMusic(id, steamid, team) {
    return new Promise((resolve, reject) => {
        connection.query(
            "INSERT INTO wp_player_music (steamid, weapon_team, music_id) values (?, ?, ?)",
            [steamid, team, id],
            (err, results, fields) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                }
                resolve(results);
            }
          );
    });
}

function updateMusic(id, steamid, team) {
    return getMusics(steamid, team).then(musics => {
        if (musics.length > 0) {
            return setMusic(id, steamid, team);
        } else {
            return addMusic(id, steamid, team);
        }
    })
}

exports.music = {
    getMusics,
    setMusic,
    addMusic,
    updateMusic
}

function getSkins(weaponid, steamid, team) {
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT * FROM wp_player_skins WHERE weapon_defindex = ? AND steamid = ? AND weapon_team = ?",
            [weaponid, steamid, team],
            (err, results, fields) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                }
                resolve(results);
            }
        );
    });
}

function setSkin(paintid, steamid, weaponid, team) {
    return new Promise((resolve, reject) => {
        connection.query(
            "UPDATE wp_player_skins SET weapon_paint_id = ? WHERE steamid = ? AND weapon_defindex = ? AND weapon_team = ?",
            [paintid, steamid, weaponid, team],
            (err, results, fields) => {
              connection.query(
                "SELECT * FROM wp_player_skins WHERE steamid = ?",
                [steamid],
                (err, results, fields) => {
                    if (err) {
                        console.error(err);
                        return reject(err);
                    }
                    resolve(results);
                }
              );
            }
        );
    });
}

function addSkin(steamid, weaponid, paintid, team) {
    return new Promise((resolve, reject) => {
        connection.query(
            "INSERT INTO wp_player_skins (steamid, weapon_defindex, weapon_paint_id, weapon_team) VALUES (?, ?, ?, ?)",
            [steamid, weaponid, paintid, team],
            (err, results, fields) => {
              connection.query(
                "SELECT * FROM wp_player_skins WHERE steamid = ?",
                [steamid],
                (err, results, fields) => {
                    if (err) {
                        console.error(err);
                        return reject(err);
                    }
                    resolve(results);
                }
              );
            }
          );
    });
}

function updateSkin(steamid, weaponid, paintid, team) {
    return getSkins(weaponid, steamid, team).then(skins => {
        if (skins.length > 0) {
            return setSkin(paintid, steamid, weaponid, team);
        } else {
            return addSkin(steamid, weaponid, paintid, team);
        }
    })
}

exports.skin = {
    getSkins,
    setSkin,
    addSkin,
    updateSkin
}

function getAgents(steamid) {
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT * FROM wp_player_agents WHERE steamid = ?",
            [steamid],
            (err, results, fields) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                }
                resolve(results);
            }
        );
    });
}

function setAgent(model, steamid, team) {
    return new Promise((resolve, reject) => {
        connection.query(
            `UPDATE wp_player_agents SET agent_${team} = ? WHERE steamid = ?`,
            [model, steamid],
            (err, results, fields) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                }
                resolve(results);
            }
        );
    });
}

function addAgent(model, steamid, team) {
    return new Promise((resolve, reject) => {
        connection.query(
            `INSERT INTO wp_player_agents (steamid, agent_${team}) VALUES (?, ?)`,
            [steamid, model],
            (err, results, fields) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                }
                resolve(results);
            }
        );
    });
}

function updateAgent(model, steamid, team) {
    return getAgents(steamid).then(agents => {
        if (agents.length > 0) {
            return setAgent(model, steamid, team);
        } else {
            return addAgent(model, steamid, team);
        }
    }).then(result => {
        return getAgents(steamid);
    })
}

exports.agent = {
    getAgents,
    setAgent,
    addAgent,
    updateAgent
}
