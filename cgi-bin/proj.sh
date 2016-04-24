#!/bin/bash
source /scratch/apps/SOURCE_ME.sh
source /scratch/apps/grass-7.0.3/SOURCE_ME.sh

r.in.gdal input=/scratch/grass/total_sun_jun_sum.tif output=jan 

N=${1}
S=${2}
E=${3}
W=${4}

#Create GRASS Envi Vars
DIRECTORY=/scratch/grass
LOCATION=${DIRECTORY}/sol_data/SOLAR_MAP/PERMANENT
GRASSRC=${DIRECTORY}/.grassrc_SOLAR_MAP
export GISRC=${GRASSRC}

#Set GRASS settings
echo "GISDBASE: ${DIRECTORY}/sol_data" > $GRASSRC
echo "LOCATION_NAME: SOLAR_MAP" >> $GRASSRC
echo "MAPSET: PERMANENT" >> $GRASSRC
echo "GRASS_GUI: text" >> $GRASSRC

res=$(echo "${W} ${N}" | m.proj -i --quiet input=-)
W=$(echo $res | cut --delimiter='|' -f1)
N=$(echo $res | cut --delimiter='|' -f2)
#echo $res | cut --delimiter='|' -f3
#res=($res)
#IFS="|" read -ra RES <<< "$res"
#W=${RES[0]}
#N=${RES[1]}

#echo "${E} ${S}" | m.proj -i
res=$(echo "${E} ${S}" | m.proj -i --quiet input=-)
E=$(echo $res | cut --delimiter='|' -f1)
S=$(echo $res | cut --delimiter='|' -f2)

#res=($res)
#IFS="|" read -ra RES <<< "$res"
#E=${RES[0]}
#S=${RES[1]}

#echo "$N"
#printf "%s\n%s\n%s\n%s\n" "$N" "$S" "$E" "$W"

echo "$N,$S,$E,$W"
