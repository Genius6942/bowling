var e = require("cannon-es"),
    t = require("three"),
    n = function() {
        var e, n, r, i, o = new t.Vector3;

        function s() {
            this.tolerance = -1, this.faces = [], this.newFaces = [], this.assigned = new c, this.unassigned = new c, this.vertices = []
        }

        function a() {
            this.normal = new t.Vector3, this.midpoint = new t.Vector3, this.area = 0, this.constant = 0, this.outside = null, this.mark = 0, this.edge = null
        }

        function u(e, t) {
            this.vertex = e, this.prev = null, this.next = null, this.twin = null, this.face = t
        }

        function h(e) {
            this.point = e, this.prev = null, this.next = null, this.face = null
        }

        function c() {
            this.head = null, this.tail = null
        }
        return Object.assign(s.prototype, {
            setFromPoints: function(e) {
                !0 !== Array.isArray(e) && console.error("THREE.ConvexHull: Points parameter is not an array."), e.length < 4 && console.error("THREE.ConvexHull: The algorithm needs at least four points."), this.makeEmpty();
                for (var t = 0, n = e.length; t < n; t++) this.vertices.push(new h(e[t]));
                return this.compute(), this
            },
            setFromObject: function(e) {
                var n = [];
                return e.updateMatrixWorld(!0), e.traverse(function(e) {
                    var r, i, o, s = e.geometry;
                    if (void 0 !== s && (s.isGeometry && (s = s.toBufferGeometry ? s.toBufferGeometry() : (new t.BufferGeometry).fromGeometry(s)), s.isBufferGeometry)) {
                        var a = s.attributes.position;
                        if (void 0 !== a)
                            for (r = 0, i = a.count; r < i; r++)(o = new t.Vector3).fromBufferAttribute(a, r).applyMatrix4(e.matrixWorld), n.push(o)
                    }
                }), this.setFromPoints(n)
            },
            containsPoint: function(e) {
                for (var t = this.faces, n = 0, r = t.length; n < r; n++)
                    if (t[n].distanceToPoint(e) > this.tolerance) return !1;
                return !0
            },
            intersectRay: function(e, t) {
                for (var n = this.faces, r = -Infinity, i = Infinity, o = 0, s = n.length; o < s; o++) {
                    var a = n[o],
                        u = a.distanceToPoint(e.origin),
                        h = a.normal.dot(e.direction);
                    if (u > 0 && h >= 0) return null;
                    var c = 0 !== h ? -u / h : 0;
                    if (!(c <= 0) && (h > 0 ? i = Math.min(c, i) : r = Math.max(c, r), r > i)) return null
                }
                return e.at(-Infinity !== r ? r : i, t), t
            },
            intersectsRay: function(e) {
                return null !== this.intersectRay(e, o)
            },
            makeEmpty: function() {
                return this.faces = [], this.vertices = [], this
            },
            addVertexToFace: function(e, t) {
                return e.face = t, null === t.outside ? this.assigned.append(e) : this.assigned.insertBefore(t.outside, e), t.outside = e, this
            },
            removeVertexFromFace: function(e, t) {
                return e === t.outside && (t.outside = null !== e.next && e.next.face === t ? e.next : null), this.assigned.remove(e), this
            },
            removeAllVerticesFromFace: function(e) {
                if (null !== e.outside) {
                    for (var t = e.outside, n = e.outside; null !== n.next && n.next.face === e;) n = n.next;
                    return this.assigned.removeSubList(t, n), t.prev = n.next = null, e.outside = null, t
                }
            },
            deleteFaceVertices: function(e, t) {
                var n = this.removeAllVerticesFromFace(e);
                if (void 0 !== n)
                    if (void 0 === t) this.unassigned.appendChain(n);
                    else {
                        var r = n;
                        do {
                            var i = r.next;
                            t.distanceToPoint(r.point) > this.tolerance ? this.addVertexToFace(r, t) : this.unassigned.append(r), r = i
                        } while (null !== r)
                    } return this
            },
            resolveUnassignedPoints: function(e) {
                if (!1 === this.unassigned.isEmpty()) {
                    var t = this.unassigned.first();
                    do {
                        for (var n = t.next, r = this.tolerance, i = null, o = 0; o < e.length; o++) {
                            var s = e[o];
                            if (0 === s.mark) {
                                var a = s.distanceToPoint(t.point);
                                if (a > r && (r = a, i = s), r > 1e3 * this.tolerance) break
                            }
                        }
                        null !== i && this.addVertexToFace(t, i), t = n
                    } while (null !== t)
                }
                return this
            },
            computeExtremes: function() {
                var e, n, r, i = new t.Vector3,
                    o = new t.Vector3,
                    s = [],
                    a = [];
                for (e = 0; e < 3; e++) s[e] = a[e] = this.vertices[0];
                for (i.copy(this.vertices[0].point), o.copy(this.vertices[0].point), e = 0, n = this.vertices.length; e < n; e++) {
                    var u = this.vertices[e],
                        h = u.point;
                    for (r = 0; r < 3; r++) h.getComponent(r) < i.getComponent(r) && (i.setComponent(r, h.getComponent(r)), s[r] = u);
                    for (r = 0; r < 3; r++) h.getComponent(r) > o.getComponent(r) && (o.setComponent(r, h.getComponent(r)), a[r] = u)
                }
                return this.tolerance = 3 * Number.EPSILON * (Math.max(Math.abs(i.x), Math.abs(o.x)) + Math.max(Math.abs(i.y), Math.abs(o.y)) + Math.max(Math.abs(i.z), Math.abs(o.z))), {
                    min: s,
                    max: a
                }
            },
            computeInitialHull: function() {
                void 0 === e && (e = new t.Line3, n = new t.Plane, r = new t.Vector3);
                var i, o, s, u, h, c, l, p, f, d = this.vertices,
                    m = this.computeExtremes(),
                    v = m.min,
                    g = m.max,
                    x = 0,
                    y = 0;
                for (c = 0; c < 3; c++)(f = g[c].point.getComponent(c) - v[c].point.getComponent(c)) > x && (x = f, y = c);
                for (x = 0, e.set((o = v[y]).point, (s = g[y]).point), c = 0, l = this.vertices.length; c < l; c++)(i = d[c]) !== o && i !== s && (e.closestPointToPoint(i.point, !0, r), (f = r.distanceToSquared(i.point)) > x && (x = f, u = i));
                for (x = -1, n.setFromCoplanarPoints(o.point, s.point, u.point), c = 0, l = this.vertices.length; c < l; c++)(i = d[c]) !== o && i !== s && i !== u && (f = Math.abs(n.distanceToPoint(i.point))) > x && (x = f, h = i);
                var w = [];
                if (n.distanceToPoint(h.point) < 0)
                    for (w.push(a.create(o, s, u), a.create(h, s, o), a.create(h, u, s), a.create(h, o, u)), c = 0; c < 3; c++) p = (c + 1) % 3, w[c + 1].getEdge(2).setTwin(w[0].getEdge(p)), w[c + 1].getEdge(1).setTwin(w[p + 1].getEdge(0));
                else
                    for (w.push(a.create(o, u, s), a.create(h, o, s), a.create(h, s, u), a.create(h, u, o)), c = 0; c < 3; c++) p = (c + 1) % 3, w[c + 1].getEdge(2).setTwin(w[0].getEdge((3 - c) % 3)), w[c + 1].getEdge(0).setTwin(w[p + 1].getEdge(1));
                for (c = 0; c < 4; c++) this.faces.push(w[c]);
                for (c = 0, l = d.length; c < l; c++)
                    if ((i = d[c]) !== o && i !== s && i !== u && i !== h) {
                        x = this.tolerance;
                        var T = null;
                        for (p = 0; p < 4; p++)(f = this.faces[p].distanceToPoint(i.point)) > x && (x = f, T = this.faces[p]);
                        null !== T && this.addVertexToFace(i, T)
                    } return this
            },
            reindexFaces: function() {
                for (var e = [], t = 0; t < this.faces.length; t++) {
                    var n = this.faces[t];
                    0 === n.mark && e.push(n)
                }
                return this.faces = e, this
            },
            nextVertexToAdd: function() {
                if (!1 === this.assigned.isEmpty()) {
                    var e, t = 0,
                        n = this.assigned.first().face,
                        r = n.outside;
                    do {
                        var i = n.distanceToPoint(r.point);
                        i > t && (t = i, e = r), r = r.next
                    } while (null !== r && r.face === n);
                    return e
                }
            },
            computeHorizon: function(e, t, n, r) {
                var i;
                this.deleteFaceVertices(n), n.mark = 1, i = null === t ? t = n.getEdge(0) : t.next;
                do {
                    var o = i.twin,
                        s = o.face;
                    0 === s.mark && (s.distanceToPoint(e) > this.tolerance ? this.computeHorizon(e, o, s, r) : r.push(i)), i = i.next
                } while (i !== t);
                return this
            },
            addAdjoiningFace: function(e, t) {
                var n = a.create(e, t.tail(), t.head());
                return this.faces.push(n), n.getEdge(-1).setTwin(t.twin), n.getEdge(0)
            },
            addNewFaces: function(e, t) {
                this.newFaces = [];
                for (var n = null, r = null, i = 0; i < t.length; i++) {
                    var o = this.addAdjoiningFace(e, t[i]);
                    null === n ? n = o : o.next.setTwin(r), this.newFaces.push(o.face), r = o
                }
                return n.next.setTwin(r), this
            },
            addVertexToHull: function(e) {
                var t = [];
                return this.unassigned.clear(), this.removeVertexFromFace(e, e.face), this.computeHorizon(e.point, null, e.face, t), this.addNewFaces(e, t), this.resolveUnassignedPoints(this.newFaces), this
            },
            cleanup: function() {
                return this.assigned.clear(), this.unassigned.clear(), this.newFaces = [], this
            },
            compute: function() {
                var e;
                for (this.computeInitialHull(); void 0 !== (e = this.nextVertexToAdd());) this.addVertexToHull(e);
                return this.reindexFaces(), this.cleanup(), this
            }
        }), Object.assign(a, {
            create: function(e, t, n) {
                var r = new a,
                    i = new u(e, r),
                    o = new u(t, r),
                    s = new u(n, r);
                return i.next = s.prev = o, o.next = i.prev = s, s.next = o.prev = i, r.edge = i, r.compute()
            }
        }), Object.assign(a.prototype, {
            getEdge: function(e) {
                for (var t = this.edge; e > 0;) t = t.next, e--;
                for (; e < 0;) t = t.prev, e++;
                return t
            },
            compute: function() {
                void 0 === i && (i = new t.Triangle);
                var e = this.edge.tail(),
                    n = this.edge.head(),
                    r = this.edge.next.head();
                return i.set(e.point, n.point, r.point), i.getNormal(this.normal), i.getMidpoint(this.midpoint), this.area = i.getArea(), this.constant = this.normal.dot(this.midpoint), this
            },
            distanceToPoint: function(e) {
                return this.normal.dot(e) - this.constant
            }
        }), Object.assign(u.prototype, {
            head: function() {
                return this.vertex
            },
            tail: function() {
                return this.prev ? this.prev.vertex : null
            },
            length: function() {
                var e = this.head(),
                    t = this.tail();
                return null !== t ? t.point.distanceTo(e.point) : -1
            },
            lengthSquared: function() {
                var e = this.head(),
                    t = this.tail();
                return null !== t ? t.point.distanceToSquared(e.point) : -1
            },
            setTwin: function(e) {
                return this.twin = e, e.twin = this, this
            }
        }), Object.assign(c.prototype, {
            first: function() {
                return this.head
            },
            last: function() {
                return this.tail
            },
            clear: function() {
                return this.head = this.tail = null, this
            },
            insertBefore: function(e, t) {
                return t.prev = e.prev, t.next = e, null === t.prev ? this.head = t : t.prev.next = t, e.prev = t, this
            },
            insertAfter: function(e, t) {
                return t.prev = e, t.next = e.next, null === t.next ? this.tail = t : t.next.prev = t, e.next = t, this
            },
            append: function(e) {
                return null === this.head ? this.head = e : this.tail.next = e, e.prev = this.tail, e.next = null, this.tail = e, this
            },
            appendChain: function(e) {
                for (null === this.head ? this.head = e : this.tail.next = e, e.prev = this.tail; null !== e.next;) e = e.next;
                return this.tail = e, this
            },
            remove: function(e) {
                return null === e.prev ? this.head = e.next : e.prev.next = e.next, null === e.next ? this.tail = e.prev : e.next.prev = e.prev, this
            },
            removeSubList: function(e, t) {
                return null === e.prev ? this.head = t.next : e.prev.next = t.next, null === t.next ? this.tail = e.prev : t.next.prev = e.prev, this
            },
            isEmpty: function() {
                return null === this.head
            }
        }), s
    }(),
    r = new t.Vector3,
    i = new t.Vector3,
    o = new t.Quaternion;

function s(e) {
    var n, r = function(e) {
        var t = [];
        return e.traverse(function(e) {
            e.isMesh && t.push(e)
        }), t
    }(e);
    if (0 === r.length) return null;
    if (1 === r.length) return a(r[0]);
    for (var i = []; n = r.pop();) i.push(c(a(n)));
    return function(e) {
        for (var n = 0, r = 0; r < e.length; r++) {
            var i = e[r].attributes.position;
            i && 3 === i.itemSize && (n += i.count)
        }
        for (var o = new Float32Array(3 * n), s = 0, a = 0; a < e.length; a++) {
            var u = e[a].attributes.position;
            if (u && 3 === u.itemSize)
                for (var h = 0; h < u.count; h++) o[s++] = u.getX(h), o[s++] = u.getY(h), o[s++] = u.getZ(h)
        }
        return (new t.BufferGeometry).setAttribute("position", new t.BufferAttribute(o, 3))
    }(i)
}

function a(e) {
    var t = e.geometry;
    return t = t.toBufferGeometry ? t.toBufferGeometry() : t.clone(), e.updateMatrixWorld(), e.matrixWorld.decompose(r, o, i), t.scale(i.x, i.y, i.z), t
}

function u(e) {
    for (var t = e.attributes.position, n = new Float32Array(3 * t.count), r = 0; r < t.count; r += 3) n[r] = t.getX(r), n[r + 1] = t.getY(r), n[r + 2] = t.getZ(r);
    return n
}

function h(e, t) {
    switch (t) {
        case "x":
            return e.x;
        case "y":
            return e.y;
        case "z":
            return e.z
    }
    throw new Error("Unexpected component " + t)
}

function c(e, n) {
    void 0 === n && (n = 1e-4), n = Math.max(n, Number.EPSILON);
    for (var r = {}, i = e.getIndex(), o = e.getAttribute("position"), s = i ? i.count : o.count, a = 0, u = [], h = [], c = Math.log10(1 / n), l = Math.pow(10, c), p = 0; p < s; p++) {
        var f = i ? i.getX(p) : p,
            d = "";
        d += ~~(o.getX(f) * l) + ",", d += ~~(o.getY(f) * l) + ",", (d += ~~(o.getZ(f) * l) + ",") in r ? u.push(r[d]) : (h.push(o.getX(f)), h.push(o.getY(f)), h.push(o.getZ(f)), r[d] = a, u.push(a), a++)
    }
    var m = new t.BufferAttribute(new Float32Array(h), o.itemSize, o.normalized),
        v = new t.BufferGeometry;
    return v.setAttribute("position", m), v.setIndex(u), v
}
var l, p = Math.PI / 2;

function f(t) {
    if (!u(t).length) return null;
    t.computeBoundingBox();
    var n = t.boundingBox;
    return {
        shape: new e.Box(new e.Vec3((n.max.x - n.min.x) / 2, (n.max.y - n.min.y) / 2, (n.max.z - n.min.z) / 2))
    }
}

function d(n) {
    var r = n.clone();
    r.quaternion.set(0, 0, 0, 1), r.updateMatrixWorld();
    var i = (new t.Box3).setFromObject(r);
    if (!isFinite(i.min.lengthSq())) return null;
    var o = new e.Box(new e.Vec3((i.max.x - i.min.x) / 2, (i.max.y - i.min.y) / 2, (i.max.z - i.min.z) / 2)),
        s = i.translate(r.position.negate()).getCenter(new t.Vector3);
    return {
        shape: o,
        offset: s.lengthSq() ? new e.Vec3(s.x, s.y, s.z) : void 0
    }
}
exports.ShapeType = void 0, (l = exports.ShapeType || (exports.ShapeType = {})).BOX = "Box", l.CYLINDER = "Cylinder", l.SPHERE = "Sphere", l.HULL = "ConvexPolyhedron", l.MESH = "Trimesh", exports.threeToCannon = function(r, i) {
    var o;
    if (void 0 === i && (i = {}), i.type === exports.ShapeType.BOX) return d(r);
    if (i.type === exports.ShapeType.CYLINDER) return function(n, r) {
        var i = ["x", "y", "z"],
            o = r.cylinderAxis || "y",
            s = i.splice(i.indexOf(o), 1) && i,
            a = (new t.Box3).setFromObject(n);
        if (!isFinite(a.min.lengthSq())) return null;
        var u = a.max[o] - a.min[o],
            c = .5 * Math.max(h(a.max, s[0]) - h(a.min, s[0]), h(a.max, s[1]) - h(a.min, s[1])),
            l = new e.Cylinder(c, c, u, 12);
        l.radiusTop = c, l.radiusBottom = c, l.height = u, l.numSegments = 12;
        var f = "y" === o ? p : 0,
            d = "z" === o ? p : 0;
        return {
            shape: l,
            orientation: (new e.Quaternion).setFromEuler(f, d, 0, "XYZ").normalize()
        }
    }(r, i);
    if (i.type === exports.ShapeType.SPHERE) return function(t, n) {
        if (n.sphereRadius) return {
            shape: new e.Sphere(n.sphereRadius)
        };
        var r = s(t);
        return r ? (r.computeBoundingSphere(), {
            shape: new e.Sphere(r.boundingSphere.radius)
        }) : null
    }(r, i);
    if (i.type === exports.ShapeType.HULL) return function(r) {
        var i = s(r);
        if (!i) return null;
        for (var o = 1e-4, a = 0; a < i.attributes.position.count; a++) i.attributes.position.setXYZ(a, i.attributes.position.getX(a) + (Math.random() - .5) * o, i.attributes.position.getY(a) + (Math.random() - .5) * o, i.attributes.position.getZ(a) + (Math.random() - .5) * o);
        for (var u = (new n).setFromObject(new t.Mesh(i)).faces, h = [], c = [], l = 0; l < u.length; l++) {
            var p = u[l],
                f = [];
            c.push(f);
            var d = p.edge;
            do {
                var m = d.head().point;
                h.push(new e.Vec3(m.x, m.y, m.z)), f.push(h.length - 1), d = d.next
            } while (d !== p.edge)
        }
        return {
            shape: new e.ConvexPolyhedron({
                vertices: h,
                faces: c
            })
        }
    }(r);
    if (i.type === exports.ShapeType.MESH) return (o = s(r)) ? function(t) {
        var n = u(t);
        if (!n.length) return null;
        var r = Object.keys(n).map(Number);
        return {
            shape: new e.Trimesh(n, r)
        }
    }(o) : null;
    if (i.type) throw new Error('[CANNON.threeToCannon] Invalid type "' + i.type + '".');
    if (!(o = s(r))) return null;
    switch (o.type) {
        case "BoxGeometry":
        case "BoxBufferGeometry":
            return f(o);
        case "CylinderGeometry":
        case "CylinderBufferGeometry":
            return function(n) {
                var r = n.parameters,
                    i = new e.Cylinder(r.radiusTop, r.radiusBottom, r.height, r.radialSegments);
                return i.radiusTop = r.radiusTop, i.radiusBottom = r.radiusBottom, i.height = r.height, i.numSegments = r.radialSegments, {
                    shape: i,
                    orientation: (new e.Quaternion).setFromEuler(t.MathUtils.degToRad(-90), 0, 0, "XYZ").normalize()
                }
            }(o);
        case "PlaneGeometry":
        case "PlaneBufferGeometry":
            return function(t) {
                t.computeBoundingBox();
                var n = t.boundingBox;
                return {
                    shape: new e.Box(new e.Vec3((n.max.x - n.min.x) / 2 || .1, (n.max.y - n.min.y) / 2 || .1, (n.max.z - n.min.z) / 2 || .1))
                }
            }(o);
        case "SphereGeometry":
        case "SphereBufferGeometry":
            return function(t) {
                return {
                    shape: new e.Sphere(t.parameters.radius)
                }
            }(o);
        case "TubeGeometry":
        case "BufferGeometry":
            return d(r);
        default:
            return console.warn('Unrecognized geometry: "%s". Using bounding box as shape.', o.type), f(o)
    }
};
//# sourceMappingURL=three-to-cannon.js.map