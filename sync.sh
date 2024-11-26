cd ../ariakit-solid-playground
git pull --no-rebase
cd ../ariakit
rm -rf ../ariakit-solid-playground/src/src
cp -r packages/ariakit-solid-core/src ../ariakit-solid-playground/src
cd ../ariakit-solid-playground
git add . && git commit -m "update" && git push
