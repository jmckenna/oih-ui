from models import Att
from test_utils import test_generation
import regions

import shapely
import shapely.wkt
import shapely.geometry

import math

class UnhandledFormatException(Exception): pass
class UnhandledDispatchException(Exception): pass



@test_generation
def _dispatch(_type, d):
    try:
        mod = __import__('conversions')
        return getattr(mod, _type)(d)
    except (KeyError, AttributeError):
        raise UnhandledDispatchException()


###
#  Types
###

def _extractField(fieldName):
    def _extractor(d):
        return Att('txt', d[fieldName])
    return _extractor


ProgramMembership = _extractField('programName')
#Organization = _extract('url')
PropertyValue = _extractField('value')
DataDownload = _extractField('contentUrl')

def Place(d):
    _formats = {'polygon': 'POLYGON ((%s))',
                'point': 'POINT (%s)'}

    geo = d.get('geo', None)
    if geo and geo.get('@type', None):
        return _dispatch(geo['@type'], geo)

    lat = d.get('latitude', None)
    lon = d.get('longitude', None)
    if lat is not None and lon is not None:
        return _geo('point', _formats['point'] % ('%s %s'% (lon, lat)))

    address = d.get('address', None)
    if address:
        return [
            Att('txt', address),
            Att('txt', regions.regionForAddress(address), 'region')
            ]

    return None


def GeoShape(geo):
    _formats = {'polygon': 'POLYGON ((%s))',
                'point': 'POINT (%s)'}

    for field, fmt in _formats.items():
        val = geo.get(field,None)
        if val:
            return _geo(field, fmt % val)
    raise UnhandledFormatException("Didn't handle %s in GeoShape" % json.dumps(geo))


def CourseInstance(data):
    atts = [_dispatch(field, data.get(field, None)) for field in ('startDate', 'endDate')]
    if 'location' in data:
        loc = data['location']
        if loc.get('@type',None):
            try:
                atts.append(_dispatch(loc['@type'], loc))
            except (UnhandledDispatchException): pass
    atts.append(Att('txt', data.get('name', data.get('description', ''))))
    # UNDONE flatten
    return [a for a in atts if a and a.value]



## Geometry processing
def _geo_polygon(feature):
    the_geom= shapely.wkt.loads(feature)
    (minx, miny, maxx, maxy) = the_geom.bounds
    if minx == -180 and maxx == 180:
        # solr can't handle this, returns org.locationtech.spatial4j.exception.InvalidShapeException: Invalid polygon, all points are coplanar
        the_geom = shapely.ops.clip_by_rect(the_geom, -179.99, -89.99, 180.0, 89.99)
        print ("Detected invalid geometry -- +- 180 bounds. Reducing slightly")

    # the_geom.length is the perimeter, I want a characteristic length
    length = math.sqrt((maxx-minx)**2 + (maxy-miny)**2)
    if len(feature) > 200:
        print ("Complicated feature: %s, %s, %s" % (the_geom.area, length, feature))

    return [
        Att('geom', the_geom.representative_point().wkt, 'point'),
        Att('geom', the_geom.simplify(0.1).wkt,'simple'),
        Att('geom', the_geom.area, 'area'),
        Att('geom', length, 'length'),
        Att('the', the_geom.wkt, 'geom'),
    ]

def _geo_default(feature):
    the_geom= shapely.wkt.loads(feature)
    return [
        Att('the', feature, 'geom'),
        Att('geom', the_geom.representative_point().wkt, 'point'),
    ]

def _geo(featuretype, feature):
    """ Create the attributes for the geometric feature
    feature: wkt representation of the feature
    returns: list of attributes
    """

    _dispatch = {'polygon': _geo_polygon }

    atts= [
        Att('txt', regions.regionsForFeature(feature), 'region'),
        Att('geom', featuretype, 'type'),
        Att('has', True, 'geom')
    ]

    atts.extend(_dispatch.get(featuretype, _geo_default)(feature))

    return atts

###
#   Individual Fields
###

def _extractDate(field):
    def _extractor(d):
        if isinstance(d, str):
            return Att('dt', d, field)
        dt = d.get('date', None)
        if dt:
            return Att('dt', dt, field)
        return None
    return _extractor

endDate = _extractDate('endDate')
startDate = _extractDate('startDate')
