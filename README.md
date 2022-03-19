# Table of Contents
  * [English](#english)
    - [How to install the git hooks globally](#how-to-install-this-hooks)
  * [Spanish](#español)
    - [Como instalar estos hooks](#como-instalar-estos-hooks)

# English

## How to install this hooks

1. First build the repo with `yarn build`
2. If you have a global hooks folder go to step 3
    1. You need to assign a folder where all of the hooks will live. in my case `~/.config/git-templates`.
    2. You can create the hooks directory with `mkdir -p ~/.config/git-templates/hooks`
    3. After that run `git config --global core.hooksPath ~/.config/git-templates/hooks`
    4. That's it, you have a default git hooks directory
3. Now you need to do a link between the built version of the hook and this directory
    1. `ln -sv $(pwd)/dist/post-checkout.js ~/.config/git-templates/hooks/post-checkout`
    2. `ln -sv $(pwd)/dist/post-merge.js ~/.config/git-templates/hooks/post-merge`
    3. `ln -sv $(pwd)/dist/post-commit.js ~/.config/git-templates/hooks/post-commit`
    4. `ln -sv $(pwd)/dist/prepare-commit-msg.js ~/.config/git-templates/hooks/prepare-commit-msg`
    5. `chmod 777 ~/.config/git-templates/hooks/*`

# Español 

## Como instalar estos hooks

1. Primero tenemos que construir nuestros hooks `yarn build`
2. Si es que ya tienes tus git-hooks globales ve al paso 3
    1. Necesitas asignar un folder donde van a vivir todos tus hooks globales, a mi me gusta usar este folder `~/.config/git-templates`.
    2. Necesitamos crear los directorios necesarios `mkdir -p ~/.config/git-templates/hooks`
    3. Despues de eso los necesitamos configurar `git config --global core.hooksPath ~/.config/git-templates/hooks`
    4. Con eso ya tienes los hooks instalados correctamente
3. Ahora necesitamos hacer una referencia a los archivos originales para poder editarlos en la carpeta cuando actualicemos estos hooks
    1. `ln -sv $(pwd)/dist/post-checkout.js ~/.config/git-templates/hooks/post-checkout`
    2. `ln -sv $(pwd)/dist/post-merge.js ~/.config/git-templates/hooks/post-merge`
    3. `ln -sv $(pwd)/dist/post-commit.js ~/.config/git-templates/hooks/post-commit`
    4. `ln -sv $(pwd)/dist/prepare-commit-msg.js ~/.config/git-templates/hooks/prepare-commit-msg`
    5. `chmod 777 ~/.config/git-templates/hooks/*`
