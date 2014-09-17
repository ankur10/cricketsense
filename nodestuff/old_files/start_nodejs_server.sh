#!/bin/bash
echo "***************************"
echo "Stopping Node JS Server"
echo "---------------------------"
/bin/bash -l -c "sh stop_nodejs_server.sh"

echo "***************************"
echo "Starting Node JS Server"
echo "---------------------------"
echo "npm install"
/bin/bash -l -c "rm -f nohup.out"
/bin/bash -l -c "npm install"

echo "***************************"

echo "node sense_nodejs_server.js --mode="$1
/bin/bash -l -c "nohup node sense_nodejs_server.js --mode=$1 &"

echo "***************************"
/bin/bash -l -c "tail nohup.out"
