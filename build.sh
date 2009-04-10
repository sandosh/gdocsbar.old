#!/bin/bash
# build.sh: build JAR and XPI files from source
# based on Nathan Yergler's build script
# Modified to work on OS X by Mike Chambers (http://mesh.typepad.com)

#### editable items (none of these can be blank)
APP_NAME=gdocsbar    # short-name, jar and xpi files name.
HAS_DEFAULTS=1       # whether the ext. provides default values for user prefs etc.
HAS_COMPONENTS=1     # whether the ext. includes any components
HAS_LOCALE=1         # package APP_NAME.jar/locale/ ?
HAS_SKIN=1           # package APP_NAME.jar/skin/ ?
KEEP_JAR=1           # leave the jar when done?
ROOT_FILES="install.rdf chrome.manifest" # put these files in root of xpi
#### editable items end

TMP_DIR=build.tmp

#uncomment to debug
set -x
mv chrome.manifest chrome.manifest.bk
mv orig.chrome.manifest chrome.manifest

# remove any left-over files
rm $APP_NAME.jar
rm $APP_NAME.xpi
rm -rf $TMP_DIR

# create xpi directory layout and populate it
mkdir $TMP_DIR
mkdir $TMP_DIR/chrome

if [ $HAS_COMPONENTS = 1 ]; then
  mkdir $TMP_DIR/components
  cp components/* $TMP_DIR/components
fi

if [ $HAS_DEFAULTS = 1 ]; then
  DEFAULT_FILES="`find ./defaults -path '*DS_Store*' -prune -o -type f -print | grep -v \~`"
  cp -R ./defaults $TMP_DIR
fi

# Copy other files to the root of future XPI.
cp $ROOT_FILES $TMP_DIR

# generate the JAR file, excluding .DS_Store and temporary files
zip -0 -r $TMP_DIR/chrome/$APP_NAME.jar `find content -path '*DS_Store*' -prune -o -type f -print | grep -v \~`
if [ $HAS_LOCALE = 1 ]; then
  zip -0 -r $TMP_DIR/chrome/$APP_NAME.jar `find locale -path '*DS_Store*' -prune -o -type f -print | grep -v \~`
fi
if [ $HAS_SKIN = 1 ]; then
  zip -0 -r $TMP_DIR/chrome/$APP_NAME.jar `find skin -path '*DS_Store*' -prune -o -type f -print | grep -v \~`
fi

# generate the XPI file
cd $TMP_DIR
zip -r ../$APP_NAME.xpi *
cd ..

if [ $KEEP_JAR = 1 ]; then
  # save the jar file
  mv $TMP_DIR/chrome/$APP_NAME.jar .
fi

# remove the working files
rm -rf $TMP_DIR

mv chrome.manifest orig.chrome.manifest
mv chrome.manifest.bk chrome.manifest
