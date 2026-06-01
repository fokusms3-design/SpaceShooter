# SpaceShooter

ENGLISH
🚀 SPACE SHOOTER — Game Rules
General Description
Space Shooter is an arcade game where you control a futuristic cannon and must destroy waves of enemy ships across 5 levels of increasing difficulty. Collect resource bags to protect your cannon with shields and try to achieve the highest score possible.

Controls
Key	Action
← →	Move cannon left / right
SPACE	Fire projectiles
P	Pause / Resume game
S	Enable / Disable sound
C	Open shields panel (from level 3)
Ctrl + F5	Reset leaderboard (admin)
Objective
Destroy all enemy ships in each level to advance. Complete all 5 levels to win the game.

Lives
You start with 3 lives.
You lose a life when hit by an enemy projectile and you have no active shield.
The game ends when you lose all 3 lives.
Enemy Ships
Ships have different shapes and colors depending on their row. Each type awards a different number of points:

Row	Shape	Color	Base Points
1	Ringed disc	🔴 Red	10 pts
2	Finned triangle	🟠 Orange	15 pts
3	Hexagon	🟡 Yellow	20 pts
4	4-pointed star	🟢 Green	25 pts
5	Double-winged diamond	🟣 Purple	30 pts
Points increase further with each advanced level.

Enemy Behavior
Ships move sideways and drop down every time they hit a wall.
In advanced levels, enemies fire multiple projectiles simultaneously:
Levels 1–2: 1 projectile per volley
Level 3: 2 projectiles per volley
Levels 4–5: 3 projectiles per volley
A ship that reaches the cannon's line is automatically destroyed and deducts 20 points.
Scoring System
Each destroyed ship awards points based on row and level.
COMBO System: if you destroy multiple ships quickly (in less than 1 second), a multiplier is activated:
COMBO x2 → double points for the current ship
COMBO x3 → triple points, etc.
The score cannot drop below 0.
Resource Bags
Three types of bags fall from the sky. Each collected bag automatically adds a shield to your inventory:

Bag	Color	Movement	Shield Provided
🥉 Bronze	Golden-brown	Straight drop	Bronze Shield — absorbs 1 impact
🥈 Silver	Silver	Straight drop	Silver Shield — absorbs 2 impacts
🥇 Gold	Golden	Sinusoidal (zig-zag) movement	Gold Shield — absorbs 3 impacts
The gold bag is the most valuable but also the hardest to catch — it moves in a zig-zag!

Shield System
Shields activate automatically in the order: Bronze → Silver → Gold.
When the active shield is completely consumed, the next one in the inventory activates automatically.
The color of the protection circle around the cannon indicates the active shield type:
🟤 Golden-brown = Bronze Shield (1 hp)
⚪ Silver = Silver Shield (2 hp)
🟡 Golden = Gold Shield (3 hp)
From level 3, press C to see the full inventory of bags and shields.
Levels
Level	Difficulty	Rows	Columns	Speed	Enemy Volley
1	Easy	2	6	Slow	1 projectile
2	Normal	3	8	Medium	1 projectile
3	Medium	4	10	Fast	2 projectiles
4	Hard	5	10	Very fast	3 projectiles
5	Extreme	5	11	Maximum	3 projectiles
Leaderboard
Scores are saved locally in the browser (localStorage).
A maximum of 10 players are kept on the leaderboard.
Each player is identified by name + password (max 6 characters).
The leaderboard displays: position, name, high score, and max level reached.
If an existing player gets a higher score, the score updates automatically.
The leaderboard is sorted in descending order by score.
Authentication
When starting the game, you enter a name (max 16 characters) and a password (max 6 characters).
If the name already exists on the leaderboard, the password must match to access the account.
If the name is new, a new account is created automatically.
Sound
The game includes procedurally generated sound effects (Web Audio API):
Shooting, explosion, collecting bag, hit, pause, combo.
Sound can be enabled/disabled anytime with the S key.
The 🔊 / 🔇 indicator in the corner of the screen shows the current state.
Win / Loss Conditions
Victory: Complete all 5 levels — all ships are destroyed.
Defeat: Lose all 3 lives.
In both cases, the score is automatically saved to the leaderboard.
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

ROMÂNĂ
🚀 SPACE SHOOTER — Regulamentul Jocului
Descriere generală
Space Shooter este un joc de tip arcade în care controlezi un tun futurist și trebuie să distrugi valuri de nave inamice pe parcursul a 5 nivele cu dificultate crescătoare. Colectează saci de resurse pentru a-ți proteja tunul cu scuturi și încearcă să obții cel mai mare punctaj posibil.

Comenzi
Tastă	Acțiune
← →	Mișcă tunul stânga / dreapta
SPACE	Trage proiectile
P	Pauză / Reluare joc
S	Activează / Dezactivează sunetul
C	Deschide panoul de scuturi (de la nivelul 3)
Ctrl + F5	Reset clasament (admin)
Obiectiv
Distruge toate navele inamice din fiecare nivel pentru a avansa. Completează toate cele 5 nivele pentru a câștiga jocul.

Vieți
Începi cu 3 vieți.
Pierzi o viață când ești lovit de un proiectil inamic și nu ai scut activ.
Jocul se termină când pierzi toate cele 3 vieți.
Nave inamice
Navele au forme și culori diferite în funcție de rândul din care fac parte. Fiecare tip acordă un număr diferit de puncte:

Rând	Formă	Culoare	Puncte de bază
1	Disc cu inel	🔴 Roșu	10 pts
2	Triunghi cu aripioare	🟠 Portocaliu	15 pts
3	Hexagon	🟡 Galben	20 pts
4	Stea cu 4 brațe	🟢 Verde	25 pts
5	Diamant cu aripi duble	🟣 Violet	30 pts
Punctele cresc suplimentar cu fiecare nivel avansat.

Comportament inamici
Navele se deplasează lateral și coboară la fiecare lovitură de perete.
La nivelele avansate, inamicii trag mai multe proiectile simultan:
Nivelele 1–2: 1 proiectil per salvă
Nivelul 3: 2 proiectile per salvă
Nivelele 4–5: 3 proiectile per salvă
O navă care ajunge la linia tunului este distrusă automat și scade 20 de puncte.
Sistem de punctaj
Fiecare navă distrusă acordă puncte în funcție de rând și nivel.
Sistem COMBO: dacă distrugi mai multe nave rapid (în mai puțin de 1 secundă), se activează un multiplicator:
COMBO x2 → puncte duble pentru nava curentă
COMBO x3 → puncte triple, etc.
Punctajul nu poate scădea sub 0.
Saci de resurse
Din cer cad saci de trei tipuri. Fiecare sac colectat adaugă automat un scut în stocul tău:

Sac	Culoare	Mișcare	Scut oferit
🥉 Bronz	Maro-auriu	Cădere dreaptă	Scut Bronz — absoarbe 1 impact
🥈 Argint	Argintiu	Cădere dreaptă	Scut Argint — absoarbe 2 impacturi
🥇 Aur	Auriu	Mișcare sinusoidală (zig-zag)	Scut Aur — absoarbe 3 impacturi
Sacul de aur este cel mai valoros dar și cel mai greu de prins — se mișcă în zig-zag!

Sistem de scuturi
Scuturile se activează automat în ordinea: Bronz → Argint → Aur.
Când scutul activ este consumat complet, se activează automat următorul din stoc.
Culoarea cercului de protecție din jurul tunului indică tipul scutului activ:
🟤 Maro-auriu = Scut Bronz (1 hp)
⚪ Argintiu = Scut Argint (2 hp)
🟡 Auriu = Scut Aur (3 hp)
De la nivelul 3, apasă C pentru a vedea stocul complet de saci și scuturi.
Nivele
Nivel	Dificultate	Rânduri	Coloane	Viteză	Salvă inamici
1	Ușor	2	6	Lentă	1 proiectil
2	Normal	3	8	Medie	1 proiectil
3	Mediu	4	10	Rapidă	2 proiectile
4	Greu	5	10	Foarte rapidă	3 proiectile
5	Extrem	5	11	Maximă	3 proiectile
Clasament
Scorurile sunt salvate local în browser (localStorage).
Se păstrează maximum 10 jucători în clasament.
Fiecare jucător este identificat prin nume + parolă (max 6 caractere).
La clasament se afișează: poziția, numele, scorul maxim și nivelul maxim atins.
Dacă un jucător existent obține un scor mai mare, scorul se actualizează automat.
Clasamentul este sortat descrescător după punctaj.
Autentificare
La pornirea jocului introduci un nume (max 16 caractere) și o parolă (max 6 caractere).
Dacă numele există deja în clasament, parola trebuie să coincidă pentru a accesa contul.
Dacă numele este nou, se creează automat un cont nou.
Sunet
Jocul include efecte sonore generate procedural (Web Audio API):
Tragere, explozie, colectare sac, lovitură, pauză, combo.
Sunetul poate fi activat/dezactivat oricând cu tasta S.
Indicatorul 🔊 / 🔇 din colțul ecranului arată starea curentă.
Condiții de victorie / înfrângere
Victorie: Completezi toate cele 5 nivele — toate navele sunt distruse.
Înfrângere: Pierzi toate cele 3 vieți.
În ambele cazuri, scorul este salvat automat în clasament.
