#!/bin/bash

echo "***************************"
echo "Starting Redis Master"
echo "---------------------------"
echo "sh redis-server redis_master.conf"
redis-server redis_master.conf

echo "\n***************************"

echo "Starting Redis Slave"
echo "---------------------------"
echo "sh redis-server redis_slave.conf"
redis-server redis_slave.conf
echo "***************************\n"

echo "***********************************"
echo "****** OUTPUT OF stdout ****"
echo "***********************************"

tail stdout
