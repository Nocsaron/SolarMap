#!/bin/bash

###########################
#  CS436 Tucson Solar Map #
###########################

#module load unsupported
#module load unsupported/czo/sol
#source /unsupported/czo/czorc


source /scratch/apps/SOURCE_ME.sh
source /scratch/apps/grass-7.0.3/SOURCE_ME.sh
N=${1}
S=${2}
E=${3}
W=${4}
MONTH=${5}
DEM="`pwd`/monthly/total_sun_${MONTH}_sum.tif"


#echo "N: ${N}"
#echo "S: ${S}"
#echo "E: ${E}"
#echo "W: ${W}"
#echo "Month: ${MONTH}"

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


#Create new projection info
#g.proj -c georef=$DEM --quiet
#g.region rast=$DEM
#g.region -s
#Import Dem
#g.remove -f "*"
#r.in.gdal input=$DEM output=dem
#g.region rast=dem

#echo "Region the month's DEM"
#echo "r.region map=${MONTH} n=${N} s=${S} e=${E} w=${W} --quiet"
#r.region map=${MONTH} n=${N} s=${S} e=${E} w=${W} --quiet

#g.list rast

#echo "Calculate Stats for month"
#echo "res=r.univar map=${MONTH} separator=comma -g --quiet"
g.region n=${N} s=${S} e=${E} w=${W} --quiet
res=$(r.univar map=${MONTH} separator=comma --quiet)
g.region -d

res=($res)
echo ${res[24]}
IFS="=" read -ra RES <<< "${res[11]}"
#echo ${RES[1]}
#r.region -d map=${MONTH} --quiet

#rm -rf ${DIRECTORY}/sol_data/tmp_${WORKING_DIR}/
#rm -r ${GRASSRC}
