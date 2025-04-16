# Proiect WEB - Heasca Antonio Ciprian - C113C
Proiectul implementează un sistem de comandă online pentru popota ATM, de livrare mâncare, conform cerințelor specificate. Sistemul este împărțit în două componente principale: aplicația pentru clienți (frontend) și panoul de administrare (admin).

## Observatii
- Acesta este un fisier .md si vizualizarea acestuia se poate face utilizand combinatia de taste Ctrl+Shift+V (in Visual Studio Code)

## Arhitectura template-urilor
Proiectul este structurat astfel:
1. Aplicația pentru Clienți (frontend):
- Implementată folosind React și Vite
- Organizată în componente reutilizabile și pagini
- Folosește React Router pentru navigare între pagini
- Include sistem de autentificare cu JWT
- Gestionează starea aplicației folosind Context API

2. Panou de Administrare (admin):
- Interfață separată pentru administratori
- Permite gestionarea produselor, comenzilor și utilizatorilor
- Implementat folosind React și Vite
- Accesibil doar utilizatorilor cu drepturi de admin


3. Tehnologii utilizate:
- HTML5
- CSS3 (cu design responsive)
- JavaScript
- React JS
- Axios pentru cereri HTTP
- React Router pentru navigare


## Funcționalități implementate
### Pagini pentru aplicația client
- Pagina de start (Homepage) - Afișează produsele, categorii, și oferă acces la meniul complet
- Pagina de autentificare - Implementată ca un popup, permite autentificarea și înregistrarea utilizatorilor
- ![alt text](image-7.png)
- ![alt text](image-8.png)
- Pagină de creare cont - Integrată în popup-ul de autentificare
- Pagina de editare profil - Permite utilizatorilor să-și modifice datele personale(nume+parola)
- ![alt text](image-6.png)
- Pagina de produse - Afișează produsele după categorie (Filtrare dupa categorie in Homepage)
- ![alt text](image-9.png)
- ![alt text](image-10.png)
- Pagina detalii produs - Oferă informații detaliate despre produse, inclusiv recenzii
- ![alt text](image-11.png)
- Coșul de cumpărături - Permite vizualizarea si adaugarea/eliminarea produselor selectate
- ![alt text](image-12.png)
- Pagina de plasare comandă - Permite finalizarea comenzii și alegerea metodei de plată
- ![alt text](image-13.png)
- Pagina comenzi - Afișează istoricul comenzilor utilizatorului
- ![alt text](image-4.png)
- ![alt text](image-5.png)
- Pagina cu detaliile de contact ale magazinului - Footer
- ![alt text](image-3.png)

### Pagini pentru administrare:
- Pagina de autentificare - Exclusiv pentru administratori (Exista redirectare catre pagina admin-ului si din popup-ul de login al paginii pentru client)
- ![alt text](image-1.png)
- ![alt text](image-2.png)
- Credentiale admin: Email="admin@popotaatm.com"; Parola="admin123"
- ![alt text](image.png)
- Gestionare produse - Listarea, adăugarea și stergerea produselor
- ![alt text](image-14.png)
- ![alt text](image-15.png)
- Gestionare comenzi - Vizualizarea și procesarea comenzilor
- ![alt text](image-16.png)
- Gestionare utilizatori - Administrarea conturilor utilizatorilor
- ![alt text](image-17.png)

## Caracteristici speciale
- Design responsive - Aplicația se adaptează la diferite dimensiuni ale ecranului
- Galerie de imagini - Pentru produse și categorii
- ![alt text](image-18.png)
- Sistem de notificări - Feedback vizual pentru acțiunile utilizatorului
- Experiență de navigare fluidă - Tranziții și animații subtile
- Sistem de recenzii - Utilizatorii pot lăsa recenzii pentru produse
- ![alt text](image-19.png)

## Instrucțiuni de utilizare
Pentru utilizarea aplicației client:
1. Accesați pagina principală pentru a explora produsele disponibile
2. Creați un cont nou sau autentificați-vă folosind butonul din colțul dreapta sus
3. Navigați prin categorii pentru a găsi produsele dorite
4. Adăugați produse în coș folosind butonul "Adaugă în coș"
5. Accesați coșul pentru a revizui produsele selectate
6. Finalizați comanda introducând detaliile de livrare
7. Vizualizați istoricul comenzilor în secțiunea "Comenzile mele"
8. Editați profilul din secțiunea "Setări cont"
9. Pentru accesarea panoului de administrare:
    - Accesați URL-ul panoului de administrare SAU logati-va cu credentialele de admin in popout-ul de pe Homepage
    - Autentificați-vă folosind credențialele de administrator
    - Utilizați meniul lateral pentru a naviga între diferitele secțiuni
    - Gestionați produsele, comenzile și utilizatorii din secțiunile dedicate


## Inițializarea și rularea proiectului
1. Pentru a rula aplicația client:
    - cd frontend
    - npm install
    - npm run dev
2. Pentru a rula panoul de administrare:
    - cd admin
    - npm install
    - npm run dev
3. Pentru a rula serverul:
    - cd backend
    - npm install
    - npm run server
4. Pentru a adăuga cheia de la google maps:
    - cd frontend
    - New-Item .env
    - Adauga in fisierul .env tocmai creat continutul: VITE_GOOGLE_MAPS_API_KEY=AIzaSyDHh6WPnSbtyjFjagTSvZYQ1qHJLrvCP28 