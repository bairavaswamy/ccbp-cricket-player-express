const express = require('express')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')

const path = require('path')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const cricketTeamDbAndNoderun = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Listing...')
    })
  } catch (error) {
    console.log(`Database Error : ${error.message}`)
    process.exit(1)
  }
}

cricketTeamDbAndNoderun()

//all palyers

app.get('/players/', async (request, response) => {
  try {
    const querry = `SELECT * FROM cricket_team ORDER BY player_id;`
    const listOFplayer = await db.all(querry)
    const fun = player => {
      return {
        playerId: player.player_id,
        playerName: player.player_name,
        jerseyNumber: player.jersey_number,
        role: player.role,
      }
    }
    response.send(listOFplayer.map(each => fun(each)))
    await db.close()
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
  } catch (error) {
    console.error(`Query Error: ${error.message}`)
    response.status(500).json({error: 'Internal Server Error'})
  }
})

//home

app.get('/', (req, res) => {
  res.send('Welcome to cricket team')
})

//singleplayer

app.get('/players/:playerId', async (request, response) => {
  try {
    const {playerId} = request.params
    const querry = `SELECT * FROM cricket_team WHERE player_id = ${playerId};`
    const player = await db.get(querry)
    const fun = player => {
      return {
        playerId: player.player_id,
        playerName: player.player_name,
        jerseyNumber: player.jersey_number,
        role: player.role,
      }
    }
    response.send(fun(player))
    await db.close()
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
  } catch (error) {
    console.error(`Query Error: ${error.message}`)
    response.status(500).json({error: 'Internal Server Error'})
  }
})

//add player

app.post('/players/', async (request, response) => {
  try {
    const playerDetails = request.body
    const {playerName, jerseyNumber, role} = playerDetails
    const query = `INSERT INTO cricket_team(player_name, jersey_number, role) VALUES (?, ?, ?);`
    const result = await db.run(query, [playerName, jerseyNumber, role])
    const id = result.lastID
    response.send('Player Added to Team')
    console.log(id)
    await db.close()
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
  } catch (error) {
    console.error(`Query Error: ${error.message}`)
    response.status(500).json({error: 'Internal Server Error'})
  }
})

//update values or details

app.put('/players/:playerId', async (request, response) => {
  try {
    const {playerId} = request.params
    const playerDetails = request.body
    const {playerName, jerseyNumber, role} = playerDetails
    const query = `UPDATE cricket_team 
    SET player_name=?, jersey_number=?, role=?
     WHERE player_id = ?;`
    await db.run(query, [playerName, jerseyNumber, role, playerId])
    response.status(200).send('Player Details Updated')
    await db.close()
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
  } catch (error) {
    console.error(`Query Error: ${error.message}`)
    response.status(500).json({error: 'Internal Server Error'})
  }
})

// player delete

app.delete('/players/:playerId', async (request, response) => {
  try {
    const {playerId} = request.params
    const query = `DELETE FROM cricket_team WHERE player_id = ?;`
    await db.run(query, [playerId])
    response.status(200).send('Player Removed')
    await db.close()
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
  } catch (error) {
    console.error(`Query Error: ${error.message}`)
    response.status(500).json({error: 'Internal Server Error'})
  }
})

module.exports = app
