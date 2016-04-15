#!/usr/bin/python

import sys
import math
from subprocess import Popen, PIPE


def ddtodms(DD):
    D = math.floor(DD)
    M = math.floor((DD - D) * 60)
    S = ((DD - D) * 60 - M) * 60
    return "%d:%d:%2d" % (D,M,S)

print 'Number of arguments:',len(sys.argv)
print 'Arguments:', str(sys.argv)

W = float(sys.argv[1])
N = float(sys.argv[2])
E = float(sys.argv[3])
S = float(sys.argv[4])

W = "%f" % (-110.95262959599495)
N = "%f" % (32.22909295633244)
E = "%f" % (-110.952275544405)
S = "%f" % (32.22883543117537)


#N = ddtodms(N)
#S = ddtodms(S)
#E = ddtodms(E)
#W = ddtodms(W)

print "\nN: %s\nS: %s\nE: %s\nW: %s\n" % (N,S,E,W)

#subprocess.call(['./sum.sh',N+'N',S+'N',E+'W',W+'W'])
#subprocess.call(['./sum.sh',N,S,E,W])
p = Popen(['./sum.sh',N,S,E,W], stdin=PIPE, stdout=PIPE, stderr=PIPE)
output,err = p.communicate()
rc = p.returncode
print err
print output
sum=float(output)
print "Total solar insolation is %d Watts\n" % (sum)
