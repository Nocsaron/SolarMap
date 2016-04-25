#!/usr/bin/python

import sys
import math
from subprocess import Popen, PIPE
import cgi, cgitb
import json

Wh_m = .00137
resolution = 0.887624139658237
r = .13
PR = .75

def ddtodms(DD):
    D = math.floor(DD)
    M = math.floor((DD - D) * 60)
    S = ((DD - D) * 60 - M) * 60
    return "%d:%d:%2d" % (D,M,S)

#print 'Number of arguments:',len(sys.argv)
#print 'Arguments:', str(sys.argv)

#W = float(sys.argv[1])
#N = float(sys.argv[2])
#E = float(sys.argv[3])
#S = float(sys.argv[4])

W = "%f" % (-110.95262959599495)
N = "%f" % (32.22909295633244)
E = "%f" % (-110.952275544405)
S = "%f" % (32.22883543117537)

form = cgi.FieldStorage() 

N = form.getvalue('north_coord')
S = form.getvalue('south_coord')
E = form.getvalue('east_coord')
W = form.getvalue('west_coord')

p = Popen(['./proj.sh',N,S,E,W], stdin=PIPE, stdout=PIPE, stderr=PIPE)
output,err = p.communicate()
rc = p.returncode
test = output.split(',')
N = test[0]
S = test[1]
E = test[2]
W = test[3]

fN = float(N)
fS = float(S)
fE = float(E)
fW = float(W)

cols = abs(int(fN-fS))
rows = abs(int(fW-fE))

area = cols*rows

print "Content-Type: application/json"
print
#print "N: %f" % fN
#print "S: %f" % fS
#print "E: %f" % fE
#print "W: %f" % fW
#print "Cols: %d" % cols
#print "Rows: %d" % rows
#print "Area: %d" % area
#quit()
#print "\nN: %s\nS: %s\nE: %s\nW: %s\n" % (N,S,E,W)

months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
monthly_watts = []
yearly_sum = 0
for month in months:
#    print "./sum.sh %s %s %s %s %s\n" % (N,S,E,W,month)
    p = Popen(['./sum.sh',N,S,E,W,month], stdin=PIPE, stdout=PIPE, stderr=PIPE)
    output,err = p.communicate()
    rc = p.returncode
#    print err
#    print output
    Wh_m2_mo  = float(output)               # Retrieve value from GRASS
    kWh_m2_mo = Wh_m2_mo / 1000             # Convert to kilowatts
    area_norm = area / resolution           # Normalize Area
    kWh_mo = area_norm * r * kWh_m2_mo * PR # Formula for potential energy output of photovoltaic system
                                            # Amjad and Malik, Estimate Electricy Production from Solar Energy Potential using GIS Techniques, ICICTT 2013
    #print 
    #print month
    #print
    #print "Wh_m2_mo = %f" % (Wh_m2_mo)
    #print "Wh_mo = %f * %f * %f" % (Wh_m2_mo,pix_size,area)
    #print "kWh_mo = %f/1000" % (Wh_mo)
    #print
    #Watts = Wh_mo * Wh_m               # 1Wh/mo = .00137W
                                        # https://www.reddit.com/r/askscience/comments/29jso3/how_to_convert_kwhm2year_into_wm2/
    monthly_watts.append(kWh_mo)
    yearly_sum += kWh_mo
monthly_watts.append(yearly_sum)    
months.append('yearly')
i = 0
for month in monthly_watts:
    #print "%r Watts in %s" % (month,months[i])
    i += 1
json_string = '{"jan":%f,"feb":%f,"mar":%f,"apr":%f,"may":%f,"jun":%f,"jul":%f,"aug":%f,"sep":%f,"oct":%f,"nov":%f,"dec":%f,"year":%f}' % (monthly_watts[0], monthly_watts[1], monthly_watts[2], monthly_watts[3], monthly_watts[4], monthly_watts[5], monthly_watts[6], monthly_watts[7], monthly_watts[8], monthly_watts[9], monthly_watts[10], monthly_watts[11], monthly_watts[12])

json_dump = json.dumps(json_string)
#print json_string
print(json_string)
#print json_dump
