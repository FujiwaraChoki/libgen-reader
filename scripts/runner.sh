#!/bin/sh

# cd to the script directory or exit if failed
cd "$(dirname "$0")" || exit 1 

# run the app and pass all arguments to the python script
echo $(python main.py $@)
