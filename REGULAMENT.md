# 🚀 SPACE SHOOTER — Regulamentul Jocului

## Descriere generală

Space Shooter este un joc de tip arcade în care controlezi un tun futurist și trebuie să distrugi valuri de nave inamice pe parcursul a 5 nivele cu dificultate crescătoare. Colectează saci de resurse pentru a-ți proteja tunul cu scuturi și încearcă să obții cel mai mare punctaj posibil.

---

## Comenzi

| Tastă | Acțiune |
|-------|---------|
| `← →` | Mișcă tunul stânga / dreapta |
| `SPACE` | Trage proiectile |
| `P` | Pauză / Reluare joc |
| `S` | Activează / Dezactivează sunetul |
| `C` | Deschide panoul de scuturi *(de la nivelul 3)* |
| `Ctrl + F5` | Reset clasament *(admin)* |

---

## Obiectiv

Distruge toate navele inamice din fiecare nivel pentru a avansa. Completează toate cele 5 nivele pentru a câștiga jocul.

---

## Vieți

- Începi cu **3 vieți**.
- Pierzi o viață când ești lovit de un proiectil inamic și nu ai scut activ.
- Jocul se termină când pierzi toate cele 3 vieți.

---

## Nave inamice

Navele au forme și culori diferite în funcție de rândul din care fac parte. Fiecare tip acordă un număr diferit de puncte:

| Rând | Formă | Culoare | Puncte de bază |
|------|-------|---------|----------------|
| 1 | Disc cu inel | 🔴 Roșu | 10 pts |
| 2 | Triunghi cu aripioare | 🟠 Portocaliu | 15 pts |
| 3 | Hexagon | 🟡 Galben | 20 pts |
| 4 | Stea cu 4 brațe | 🟢 Verde | 25 pts |
| 5 | Diamant cu aripi duble | 🟣 Violet | 30 pts |

> Punctele cresc suplimentar cu fiecare nivel avansat.

### Comportament inamici
- Navele se deplasează lateral și coboară la fiecare lovitură de perete.
- La nivelele avansate, inamicii trag mai multe proiectile simultan:
  - Nivelele 1–2: 1 proiectil per salvă
  - Nivelul 3: 2 proiectile per salvă
  - Nivelele 4–5: 3 proiectile per salvă
- O navă care ajunge la linia tunului este distrusă automat și **scade 20 de puncte**.

---

## Sistem de punctaj

- Fiecare navă distrusă acordă puncte în funcție de rând și nivel.
- **Sistem COMBO:** dacă distrugi mai multe nave rapid (în mai puțin de 1 secundă), se activează un multiplicator:
  - COMBO x2 → puncte duble pentru nava curentă
  - COMBO x3 → puncte triple, etc.
- Punctajul nu poate scădea sub 0.

---

## Saci de resurse

Din cer cad saci de trei tipuri. Fiecare sac colectat adaugă automat un scut în stocul tău:

| Sac | Culoare | Mișcare | Scut oferit |
|-----|---------|---------|-------------|
| 🥉 Bronz | Maro-auriu | Cădere dreaptă | Scut Bronz — absoarbe **1 impact** |
| 🥈 Argint | Argintiu | Cădere dreaptă | Scut Argint — absoarbe **2 impacturi** |
| 🥇 Aur | Auriu | **Mișcare sinusoidală** *(zig-zag)* | Scut Aur — absoarbe **3 impacturi** |

> Sacul de aur este cel mai valoros dar și cel mai greu de prins — se mișcă în zig-zag!

---

## Sistem de scuturi

- Scuturile se activează **automat** în ordinea: **Bronz → Argint → Aur**.
- Când scutul activ este consumat complet, se activează automat următorul din stoc.
- Culoarea cercului de protecție din jurul tunului indică tipul scutului activ:
  - 🟤 Maro-auriu = Scut Bronz (1 hp)
  - ⚪ Argintiu = Scut Argint (2 hp)
  - 🟡 Auriu = Scut Aur (3 hp)
- De la **nivelul 3**, apasă `C` pentru a vedea stocul complet de saci și scuturi.

---

## Nivele

| Nivel | Dificultate | Rânduri | Coloane | Viteză | Salvă inamici |
|-------|-------------|---------|---------|--------|---------------|
| 1 | Ușor | 2 | 6 | Lentă | 1 proiectil |
| 2 | Normal | 3 | 8 | Medie | 1 proiectil |
| 3 | Mediu | 4 | 10 | Rapidă | 2 proiectile |
| 4 | Greu | 5 | 10 | Foarte rapidă | 3 proiectile |
| 5 | Extrem | 5 | 11 | Maximă | 3 proiectile |

---

## Clasament

- Scorurile sunt salvate local în browser (localStorage).
- Se păstrează **maximum 10 jucători** în clasament.
- Fiecare jucător este identificat prin **nume + parolă** (max 6 caractere).
- La clasament se afișează: poziția, numele, scorul maxim și nivelul maxim atins.
- Dacă un jucător existent obține un scor mai mare, scorul se actualizează automat.
- Clasamentul este sortat descrescător după punctaj.

---

## Autentificare

- La pornirea jocului introduci un **nume** (max 16 caractere) și o **parolă** (max 6 caractere).
- Dacă numele există deja în clasament, parola trebuie să coincidă pentru a accesa contul.
- Dacă numele este nou, se creează automat un cont nou.

---

## Sunet

- Jocul include efecte sonore generate procedural (Web Audio API):
  - Tragere, explozie, colectare sac, lovitură, pauză, combo.
- Sunetul poate fi activat/dezactivat oricând cu tasta `S`.
- Indicatorul 🔊 / 🔇 din colțul ecranului arată starea curentă.

---

## Condiții de victorie / înfrângere

- **Victorie:** Completezi toate cele 5 nivele — toate navele sunt distruse.
- **Înfrângere:** Pierzi toate cele 3 vieți.
- În ambele cazuri, scorul este salvat automat în clasament.
