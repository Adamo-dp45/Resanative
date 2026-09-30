### Icône de resanative

- **La place retenue** — un siège et sa coche, fond ambre `#F59E0B`, tracé blanc, coche brune `#78350F`
    > MÊME ICÔNE que `resaflutter` : ce sont deux implémentations de la MÊME application cliente, pas deux produits. `commercialflutter` prend le brun, les deux publics étant disjoints (le client, l'agent à bord)
    > Trois propositions non retenues sont gardées dans `propositions/` avec leur aperçu : `r1-ligne` (la ligne et ses arrêts, l'icône du back-office), `r3-epingle` (où est mon car), `r4-bon` (le bon de réservation)

- **Régénérer** : `python branding/generer.py`
    > Chrome sans interface rend le SVG à 1024 px, Pillow réduit en LANCZOS. Un export direct en petite taille crénelle le trait — même chaîne que les icônes du back-office et que les deux applications Flutter
    > Produit `assets/images/` : `icon.png` (1024, APLATIE), `android-icon-{background,foreground,monochrome}.png` (1024), `favicon.png` (48) et `splash-icon.png` (512)
    > !! LE SCRIPT NE TOUCHE PAS À `app.json`. Il vérifie seulement que `android.adaptiveIcon.backgroundColor` et le `backgroundColor` du greffon `expo-splash-screen` suivent toujours le fond du SVG, et le DIT sinon — deux déclarations d'une même couleur divergent, et un script qui réécrit la configuration à l'aveugle est pire que l'écart qu'il corrige

- **Changer d'icône**
    > Copier un `propositions/<nom>/icon.svg` par-dessus `icon.svg`, adapter `icon-monochrome.svg`, relancer le script, puis accorder les deux couleurs d'`app.json` qu'il signale
    > CONVENTION DU SVG : un `<rect id="fond">` porte l'aplat, un `<g id="dessin">` porte le tracé. Le script s'en sert pour fabriquer les variantes — sans fond pour l'adaptatif et pour le splash, recadrée pour la zone sûre d'Android
    > `icon-monochrome.svg` est la SILHOUETTE du même dessin, aux MÊMES COORDONNÉES : le script lui applique le cadrage mesuré sur le dessin principal, parce que les deux calques se superposent dans le lanceur

- **Les pièges tenus par le script**
    > !! LA ZONE SÛRE D'ANDROID EST UN RAYON, PAS UNE LARGEUR. Le lanceur rogne l'icône adaptative avec un masque dont le pire cas est un CERCLE : c'est la demi-diagonale du dessin qui doit tenir dans les 66 dp centraux d'un canevas de 108 dp, soit un rayon de 0,3055. L'échelle est donc MESURÉE sur un rendu sans fond (`encombrement()`) et non écrite à la main — un premier jet qui réduisait le canevas de 34 % laissait le tracé à 33 % de la largeur, la moitié de ce qu'Android attend, et l'erreur aurait suivi chaque nouveau dessin
    > !! iOS REFUSE LA TRANSPARENCE sur une icône d'application : le paquet est rejeté à l'envoi. `icon.png` est donc APLATIE sur la couleur de fond, les autres gardent leur canal alpha
    > !! LE SPLASH POSE LE DESSIN SEUL, sans son carré de fond, sur le `backgroundColor` du greffon : un carré d'icône posé au milieu d'un aplat de la même couleur dessinerait un liseré partout où les deux ne tombent pas juste

- **Reste de l'ancienne icône**
    > `assets/expo.icon/` est l'icône Expo par défaut au format Icon Composer. `app.json` ne la référence plus (`ios.icon` pointe sur `assets/images/icon.png`) : le dossier est mort et peut être supprimé
