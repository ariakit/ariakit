if [[ "$VERCEL_GIT_COMMIT_REF" == "v0" ]] ; then
  exit 1;
else
  exit 0;
fi
