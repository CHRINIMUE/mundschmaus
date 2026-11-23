# Chowdown

A simple, plaintext recipe database for hackers

[http://chowdown.io](http://chowdown.io)

# Getting Started

This is a Jekyll build. Make sure you have Jekyll [installed](https://jekyllrb.com/). To install, run this command in the terminal (or iTerm, etc):

```gem install bundler jekyll```

or to check if you've got it installed already:

```jekyll -v```

Clone or download this repo. Navigate to the folder in terminal (or iTerm, etc), and then run:

```jekyll serve```

With default settings, you should be able to view the site locally at `http://127.0.0.1:4000/`

# Writing a Recipe

The recipes are stored in the collection "Recipes" (the folder /_recipes).

They are written in Markdown and contain a few special sections:

- The frontmatter, which contains:
 - Title, Image, and Layout (which is "recipe")
 - Ingredients (a list of things in the dish)
 - Directions (a list of steps for the dish)
- Body content (for intros, stories, written detail)

If you need help with Markdown, here's a [handy cheatsheet](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet).

# Writing a component recipe

A component recipe is a special recipe made up of other recipes. To make a new component recipe:

- place your smaller, single recipes into the /_components folder
- make a new recipe like normal in the /_recipes folders
- in the frontmatter of this new recipe, include your recipes from the /_components folder (instead of the usual Ingredeints list)

You can an example on the Red Berry Tart recipe. 

- [example Markdown](https://raw.githubusercontent.com/clarklab/chowdown/gh-pages/_recipes/red-berry-tart.md)
- [example recipe page](https://chowdown.io/recipes/red-berry-tart.html)

## Komponenten per Datei referenzieren

Komponenten werden per Markdown-Datei referenziert:

```yml
components:
	- file: kuerbispuree.md
		amount: 240
		unit: g
```

In der Komponente selbst kannst du definieren, welche Menge eine Basis-Portion ist:

```yml
serving_size: 250
serving_unit: g
```

Damit wird der Multiplikator automatisch berechnet (`amount / serving_size`).
Im Beispiel oben also `240 / 250 = 0.96`.

Optional kannst du weiterhin `servings` statt `amount/unit` nutzen, wenn du über Portionen arbeiten willst.

## Mengenangabe bei kleinteiligen Rezepten

Bei Rezepten, die viele einzelne Stücke ergeben (Lebkuchen, Muffins, Stangen …), kannst du definieren, wie viel ein Rezept ergibt und wie viel eine Portion ist:

```yml
servings: 44
serving_size: 22
serving_unit: "Lebkuchen"
```

- `servings` ist die Gesamtmenge des Rezepts (wie bisher).
- `serving_size` (optional) ist die Menge pro Portion – "1 Portion = 22 Lebkuchen".
- `serving_unit` (optional) ist die Bezeichnung der Menge, z. B. "Lebkuchen" oder "Stangen".

Ohne diese Felder bleibt alles wie bisher ("4 Portionen", ±1). Mit `serving_size` springt der +-/--Selektor um je 1 Portion (z. B. ±22) und zeigt darunter an, wie viele Portionen der aktuellen Menge entsprechen.