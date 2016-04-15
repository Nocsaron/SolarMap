#!/bin/bash

###########################
#  CS436 Tucson Solar Map #
###########################

module load unsupported
module load unsupported/czo/sol
source /unsupported/czo/czorc

N=${1}
S=${2}
E=${3}
W=${4}
MONTH=${5}
DEM="ua_dsm_1ft.tif"
DEM="`pwd`/monthly/total_sun_apr_sum.tif"


#echo "N: ${N}"
#echo "S: ${S}"
#echo "E: ${E}"
#echo "W: ${W}"
#echo "Month: ${MONTH}"


#exit 0

#Create GRASS Envi Vars
DIRECTORY=`pwd`
WORKING_DIR=$RANDOM
LOCATION=${DIRECTORY}/sol_data/tmp_${WORKING_DIR}/PERMANENT
GRASSRC=${DIRECTORY}/.grassrc_${WORKING_DIR}
export GISRC=${GRASSRC}

#Create location directory structure
if [ ! -e $LOCATION ]; then
mkdir -p $LOCATION
fi
#Set wind info
if [ ! -e ${LOCATION}/DEFAULT_WIND ]; then
cat > "${LOCATION}/DEFAULT_WIND" << __EOF__
proj: 99
zone: 0
north: 1
south: 0
east: 1
west: 0
cols: 1
rows: 1
e-w resol: 1
n-s resol: 1
top: 1.000000000000000
bottom: 0.000000000000000
cols3: 1
rows3: 1
depths: 1
e-w resol3: 1
n-s resol3: 1
t-b resol: 1
__EOF__
cp ${LOCATION}/DEFAULT_WIND ${LOCATION}/WIND
fi
#Set GRASS settings
echo "GISDBASE: ${DIRECTORY}/sol_data" > $GRASSRC
echo "LOCATION_NAME: tmp_${WORKING_DIR}" >> $GRASSRC
echo "MAPSET: PERMANENT" >> $GRASSRC
echo "GRASS_GUI: text" >> $GRASSRC

#Create new projection info
g.proj -c georef=$DEM --quiet
#Import Dem
g.mremove -f "*" --quiet
r.in.gdal input=$DEM output=dem --quiet
g.region rast=dem --quiet


res=$(echo "${W} ${N}" | m.proj -i --quiet)
res=($res)
W=${res[0]}
N=${res[1]}

res=$(echo "${E} ${S}" | m.proj -i --quiet)
res=($res)
E=${res[0]}
S=${res[1]}

r.region map=dem n=${N} s=${S} e=${E} w=${W} --quiet

#r.sum rast=dem
res="$(r.sum rast=dem --quiet)"
res=($res)
sum=${res[2]}
echo $sum

rm -rf ${DIRECTORY}/sol_data/tmp_${WORKING_DIR}/
rm -r ${GRASSRC}
