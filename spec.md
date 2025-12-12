@startuml
!define RECTANGLE class
skinparam rectangle {
  BackgroundColor<<Frontend>> #D5E8D4
  BackgroundColor<<Backend>> #FFF2CC
  BackgroundColor<<External>> #E1D5E7
  BorderColor black
}

actor "User" as User

RECTANGLE "Frontend (React + WebAudio + Three.js)" <<Frontend>> {
  RECTANGLE "Login/Register Page"
  RECTANGLE "Dashboard / Home"
  RECTANGLE "Song Browser & Detail Page"
  RECTANGLE "Karaoke Practice Page"
  RECTANGLE "Recording Page"
  RECTANGLE "Performance Mode Page"
  RECTANGLE "Game Mode Page"
  RECTANGLE "Leaderboard Page"
  RECTANGLE "Competition Page"
}

RECTANGLE "Backend API (Node.js/NestJS)" <<Backend>> {
  RECTANGLE "Auth Service"
  RECTANGLE "User Settings Service"
  RECTANGLE "Songs Service"
  RECTANGLE "Practice Sessions Service"
  RECTANGLE "Performance Scoring Service"
  RECTANGLE "Game Mode Service"
  RECTANGLE "Leaderboard Service"
  RECTANGLE "Competition Service"
}

RECTANGLE "Database (PostgreSQL)" <<Backend>> {
  RECTANGLE "users / user_settings / sessions"
  RECTANGLE "songs / song_metadata"
  RECTANGLE "leaderboard / game_sessions / user_points / competitions / competition_entries"
}

RECTANGLE "External Services" <<External>> {
  RECTANGLE "YouTube Player / YouTube Data API"
}

' User interactions
User --> "Login/Register Page" : login/register
User --> "Dashboard / Home" : view progress & suggested genres
User --> "Song Browser & Detail Page" : browse songs
User --> "Karaoke Practice Page" : practice karaoke
User --> "Recording Page" : record session
User --> "Performance Mode Page" : sing performance
User --> "Game Mode Page" : play game
User --> "Leaderboard Page" : view top scores
User --> "Competition Page" : submit / view competition

' Frontend -> Backend API
"Login/Register Page" --> "Auth Service" : POST /auth/register, /auth/login
"Dashboard / Home" --> "User Settings Service" : GET /users/{id}/settings
"Song Browser & Detail Page" --> "Songs Service" : GET /songs, /songs/{id}
"Karaoke Practice Page" --> "Practice Sessions Service" : POST /sessions
"Performance Mode Page" --> "Performance Scoring Service" : POST /performance/score
"Game Mode Page" --> "Game Mode Service" : POST /game/session
"Leaderboard Page" --> "Leaderboard Service" : GET /leaderboard/{song_id}
"Competition Page" --> "Competition Service" : GET /competitions, POST /competitions/{id}/submit

' Backend -> Database
"Auth Service" --> "users / user_settings / sessions"
"User Settings Service" --> "users / user_settings / sessions"
"Songs Service" --> "songs / song_metadata"
"Practice Sessions Service" --> "sessions"
"Performance Scoring Service" --> "leaderboard"
"Game Mode Service" --> "user_points / game_sessions"
"Leaderboard Service" --> "leaderboard"
"Competition Service" --> "competitions / competition_entries"

' Frontend -> External Services
"Karaoke Practice Page" --> "YouTube Player / YouTube Data API" : fetch/play tracks
"Song Browser & Detail Page" --> "YouTube Player / YouTube Data API" : search tracks

@enduml
