"""Régénère les images d'icône de l'application Expo à partir de branding/icon.svg.

    python branding/generer.py

CHAÎNE DE RENDU : Chrome sans interface rend le SVG à 1024 px, Pillow réduit en
LANCZOS. Un export direct en petite taille crénelle le trait — c'est la même
chaîne que les icônes du back-office (cf. Frontend-Transport/public/icons) et que
les deux applications Flutter.

POUR CHANGER D'ICÔNE : copier un branding/propositions/<nom>/icon.svg par-dessus
branding/icon.svg, adapter branding/icon-monochrome.svg (la silhouette, dessin
plein sans couleur, AUX MÊMES COORDONNÉES que le dessin principal), puis
relancer. Le script ne touche PAS à app.json : il se contente de signaler si les
couleurs qui y sont déclarées ne suivent plus le fond du SVG.

CONVENTION DU SVG SOURCE : un `<rect id="fond">` porte l'aplat de couleur, un
`<g id="dessin">` porte le tracé.
"""

import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image

RACINE = Path(__file__).resolve().parent.parent
BRANDING = RACINE / "branding"
IMAGES = RACINE / "assets/images"

RENDU = 1024

# RAYON SÛR, en unités du viewBox (512). C'est un RAYON et non une largeur : le
# lanceur Android rogne l'icône adaptative avec un masque dont le pire cas est un
# CERCLE, donc c'est la demi-diagonale du dessin qui doit y tenir. Android ne
# montre que les 66 dp centraux d'un canevas de 108 dp, soit un rayon de 0,3055.
RAYON_ADAPTATIF = 0.3055 * 512


def chrome() -> str:
    candidats = [
        os.environ.get("CHROME"),
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        shutil.which("chrome"),
        shutil.which("google-chrome"),
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    ]
    for c in candidats:
        if c and Path(c).exists():
            return c
    sys.exit("Chrome introuvable : renseigner la variable d'environnement CHROME.")


def rendre(svg: str) -> Image.Image:
    with tempfile.TemporaryDirectory() as tmp:
        src, out = Path(tmp) / "i.svg", Path(tmp) / "i.png"
        src.write_text(svg, encoding="utf-8")
        subprocess.run(
            [
                chrome(), "--headless", "--disable-gpu", "--hide-scrollbars",
                "--force-device-scale-factor=1",
                "--default-background-color=00000000",
                f"--window-size={RENDU},{RENDU}",
                f"--screenshot={out}", str(src),
            ],
            check=True, capture_output=True,
        )
        return Image.open(out).convert("RGBA")


def variante(svg: str, fond: bool = True) -> str:
    return svg if fond else re.sub(r'<rect id="fond"[^>]*/>', "", svg)


def encombrement(svg: str) -> tuple:
    """Centre et demi-diagonale du DESSIN SEUL, mesurés sur un rendu sans fond.
    Mesuré et non supposé : une échelle écrite à la main vaut pour le dessin
    qu'on avait sous les yeux et devient fausse à la proposition suivante."""
    boite = rendre(variante(svg, fond=False)).split()[3].getbbox()
    if boite is None:
        return 256.0, 256.0, 256.0
    x0, y0, x1, y1 = (valeur * 512 / RENDU for valeur in boite)
    demi = ((x1 - x0) ** 2 + (y1 - y0) ** 2) ** 0.5 / 2
    return (x0 + x1) / 2, (y0 + y1) / 2, demi


def cadrer(svg: str, mesure: tuple, rayon: float, fond: bool = True) -> str:
    cx, cy, demi = mesure
    echelle = min(1.0, rayon / demi)
    return variante(svg, fond).replace(
        '<g id="dessin">',
        f'<g id="dessin" transform="translate(256 256) scale({echelle:.4f}) '
        f'translate({-cx:.2f} {-cy:.2f})">',
    )


def couleur_fond(svg: str) -> tuple:
    trouve = re.search(r'<rect id="fond"[^>]*fill="#([0-9A-Fa-f]{6})"', svg)
    valeur = trouve.group(1) if trouve else "FFFFFF"
    return tuple(int(valeur[i:i + 2], 16) for i in (0, 2, 4))


def ecrire(source: Image.Image, taille: int, chemin: Path, opaque=None) -> None:
    chemin.parent.mkdir(parents=True, exist_ok=True)
    image = source.resize((taille, taille), Image.LANCZOS)
    if opaque is not None:
        plat = Image.new("RGB", image.size, opaque)
        plat.paste(image, mask=image.split()[3])
        image = plat
    image.save(chemin)
    print(f"  {chemin.relative_to(RACINE).as_posix()}  {taille}px")


def verifier_app_json(fond: tuple) -> None:
    """Le fond de l'icône vit dans le SVG, mais app.json le REDIT pour le
    pourtour de l'adaptative et pour le splash. Deux déclarations pour une même
    couleur divergent : on ne les réécrit pas à l'aveugle, on prévient."""
    attendu = "#%02X%02X%02X" % fond
    fichier = RACINE / "app.json"
    config = json.loads(fichier.read_text(encoding="utf-8"))["expo"]
    declarees = {
        "android.adaptiveIcon.backgroundColor":
            config.get("android", {}).get("adaptiveIcon", {}).get("backgroundColor"),
    }
    for greffon in config.get("plugins", []):
        if isinstance(greffon, list) and greffon[0] == "expo-splash-screen":
            declarees["expo-splash-screen.backgroundColor"] = greffon[1].get("backgroundColor")
    for cle, valeur in declarees.items():
        if valeur and valeur.upper() != attendu:
            print(f"  !! app.json {cle} vaut {valeur}, le fond de l'icône est "
                  f"{attendu} — à accorder à la main")


def main() -> None:
    svg = (BRANDING / "icon.svg").read_text(encoding="utf-8")
    fond = couleur_fond(svg)

    print("Rendu des variantes...")
    mesure = encombrement(svg)
    print(f"  dessin : centre ({mesure[0]:.0f}, {mesure[1]:.0f}), "
          f"demi-diagonale {mesure[2]:.0f}/256")
    plein = rendre(variante(svg))
    premier_plan = rendre(cadrer(svg, mesure, RAYON_ADAPTATIF, fond=False))
    dessin_seul = rendre(variante(svg, fond=False))

    source_mono = BRANDING / "icon-monochrome.svg"
    mono = (
        rendre(cadrer(source_mono.read_text(encoding="utf-8"), mesure,
                      RAYON_ADAPTATIF, fond=False))
        if source_mono.exists() else None
    )

    print("Expo")
    # L'icône d'application est APLATIE : iOS refuse la transparence sur une
    # icône, le paquet est rejeté à l'envoi.
    ecrire(plein, 1024, IMAGES / "icon.png", opaque=fond)
    ecrire(Image.new("RGBA", (RENDU, RENDU), fond + (255,)), 1024,
           IMAGES / "android-icon-background.png")
    ecrire(premier_plan, 1024, IMAGES / "android-icon-foreground.png")
    if mono:
        ecrire(mono, 1024, IMAGES / "android-icon-monochrome.png")
    ecrire(plein, 48, IMAGES / "favicon.png")
    # Le splash pose le DESSIN SEUL sur la couleur de fond déclarée dans
    # app.json : un carré d'icône posé au milieu d'un aplat de la même couleur
    # dessinerait un liseré visible là où les deux ne tombent pas juste.
    ecrire(dessin_seul, 512, IMAGES / "splash-icon.png")

    verifier_app_json(fond)

    print("Aperçus des propositions")
    for dossier in sorted((BRANDING / "propositions").iterdir()):
        if (dossier / "icon.svg").exists():
            ecrire(rendre((dossier / "icon.svg").read_text(encoding="utf-8")),
                   512, dossier / "apercu.png")


if __name__ == "__main__":
    main()
