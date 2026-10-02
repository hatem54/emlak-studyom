/**
 * ============================================================================
 * BEZIER CURVES MODULE
 * modules/bezier-curves.js
 * ============================================================================
 * After Effects / Pen Tool kavis ve Bézier eğrisi matematik motoru.
 * Çizim esnasında dinamik tanjant tutamaçları ve çizim sonrasında
 * köşe / kenar orta nokta kavisleme (curvature) işlemlerini yönetir.
 * ============================================================================
 */

(function(window) {
    'use strict';

    const BezierCurves = {
        /**
         * t parametresine [0, 1] göre Kübik Bézier noktası hesaplar
         */
        evalCubic(p0, cp1, cp2, p1, t) {
            const mt = 1 - t;
            const mt2 = mt * mt;
            const mt3 = mt2 * mt;
            const t2 = t * t;
            const t3 = t2 * t;
            return {
                x: mt3 * p0.x + 3 * mt2 * t * cp1.x + 3 * mt * t2 * cp2.x + t3 * p1.x,
                y: mt3 * p0.y + 3 * mt2 * t * cp1.y + 3 * mt * t2 * cp2.y + t3 * p1.y
            };
        },

        /**
         * t parametresine [0, 1] göre Kuadratik Bézier noktası hesaplar
         */
        evalQuad(p0, q, p1, t) {
            const mt = 1 - t;
            const mt2 = mt * mt;
            const t2 = t * t;
            return {
                x: mt2 * p0.x + 2 * mt * t * q.x + t2 * p1.x,
                y: mt2 * p0.y + 2 * mt * t * q.y + t2 * p1.y
            };
        },

        /**
         * İki nokta (p0, p1) arasındaki orta nokta (M) sürüklendiğinde
         * eğrinin tam M noktasından geçmesini sağlayan kübik kontrol noktalarını (cp1, cp2) çözer.
         * B_cubic(0.5) = M
         */
        computeCurveFromMidpoint(p0, p1, M) {
            // Kuadratik kontrol noktası: Q = 2*M - 0.5*(p0 + p1)
            const qx = 2 * M.x - 0.5 * (p0.x + p1.x);
            const qy = 2 * M.y - 0.5 * (p0.y + p1.y);
            // Kuadratikten kübik kontrol noktalarına dönüşüm:
            // CP1 = (1/3)*p0 + (2/3)*Q
            // CP2 = (1/3)*p1 + (2/3)*Q
            const cp1 = {
                x: (p0.x + 2 * qx) / 3,
                y: (p0.y + 2 * qy) / 3
            };
            const cp2 = {
                x: (p1.x + 2 * qx) / 3,
                y: (p1.y + 2 * qy) / 3
            };
            return { cp1, cp2, q: { x: qx, y: qy } };
        },

        /**
         * İki nokta arasındaki kenar orta noktasını döner
         */
        getSegmentMidpoint(p0, p1) {
            if (p0.cpOut || p1.cpIn) {
                const cp1 = p0.cpOut || p0;
                const cp2 = p1.cpIn || p1;
                return this.evalCubic(p0, cp1, cp2, p1, 0.5);
            }
            return {
                x: (p0.x + p1.x) / 2,
                y: (p0.y + p1.y) / 2
            };
        },

        /**
         * Noktalar dizisini SVG path "d" özniteliğine dönüştürür
         */
        pointsToSvgPath(points, closed = true, offsetX = 0, offsetY = 0) {
            if (!points || points.length === 0) return '';
            if (points.length === 1) {
                return `M ${(points[0].x - offsetX).toFixed(1)} ${(points[0].y - offsetY).toFixed(1)}`;
            }

            let d = `M ${(points[0].x - offsetX).toFixed(1)} ${(points[0].y - offsetY).toFixed(1)}`;

            for (let i = 1; i < points.length; i++) {
                const prev = points[i - 1];
                const curr = points[i];
                if (prev.cpOut || curr.cpIn) {
                    const cp1 = prev.cpOut || prev;
                    const cp2 = curr.cpIn || curr;
                    d += ` C ${(cp1.x - offsetX).toFixed(1)},${(cp1.y - offsetY).toFixed(1)} ${(cp2.x - offsetX).toFixed(1)},${(cp2.y - offsetY).toFixed(1)} ${(curr.x - offsetX).toFixed(1)},${(curr.y - offsetY).toFixed(1)}`;
                } else {
                    d += ` L ${(curr.x - offsetX).toFixed(1)} ${(curr.y - offsetY).toFixed(1)}`;
                }
            }

            if (closed && points.length > 2) {
                const last = points[points.length - 1];
                const first = points[0];
                if (last.cpOut || first.cpIn) {
                    const cp1 = last.cpOut || last;
                    const cp2 = first.cpIn || first;
                    d += ` C ${(cp1.x - offsetX).toFixed(1)},${(cp1.y - offsetY).toFixed(1)} ${(cp2.x - offsetX).toFixed(1)},${(cp2.y - offsetY).toFixed(1)} ${(first.x - offsetX).toFixed(1)},${(first.y - offsetY).toFixed(1)} Z`;
                } else {
                    d += ` Z`;
                }
            }

            return d;
        },

        /**
         * SaberEngine (WebGL neon) ve Canvas için kavisli eğrileri pürüzsüz noktalara örnekler
         */
        samplePathWithCurves(points, closed = true, steps = 14) {
            if (!points || points.length < 2) return points ? points.slice() : [];

            const result = [];
            const n = points.length;
            const numSegments = closed ? n : (n - 1);

            for (let i = 0; i < numSegments; i++) {
                const p0 = points[i];
                const p1 = points[(i + 1) % n];

                if (p0.cpOut || p1.cpIn) {
                    const cp1 = p0.cpOut || p0;
                    const cp2 = p1.cpIn || p1;
                    // Alt örnekleme adımları
                    for (let s = 0; s < steps; s++) {
                        const t = s / steps;
                        result.push(this.evalCubic(p0, cp1, cp2, p1, t));
                    }
                } else {
                    result.push({ x: p0.x, y: p0.y });
                }
            }

            // Döngü tamamlayıcı son nokta
            if (closed) {
                result.push({ x: points[0].x, y: points[0].y });
            } else {
                result.push({ x: points[n - 1].x, y: points[n - 1].y });
            }

            return result;
        },

        /**
         * Eğrilerin taşmasını da kapsayan kesin dış sınırlayıcı kutu (bounding box) hesaplar
         */
        computePathBounds(points, closed = true) {
            if (!points || points.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
            
            const sampled = this.samplePathWithCurves(points, closed, 16);
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

            sampled.forEach(pt => {
                if (pt.x < minX) minX = pt.x;
                if (pt.y < minY) minY = pt.y;
                if (pt.x > maxX) maxX = pt.x;
                if (pt.y > maxY) maxY = pt.y;
            });

            // Kontrol noktalarını da sınır kontrolüne dahil et
            points.forEach(pt => {
                if (pt.cpIn) {
                    if (pt.cpIn.x < minX) minX = pt.cpIn.x;
                    if (pt.cpIn.y < minY) minY = pt.cpIn.y;
                    if (pt.cpIn.x > maxX) maxX = pt.cpIn.x;
                    if (pt.cpIn.y > maxY) maxY = pt.cpIn.y;
                }
                if (pt.cpOut) {
                    if (pt.cpOut.x < minX) minX = pt.cpOut.x;
                    if (pt.cpOut.y < minY) minY = pt.cpOut.y;
                    if (pt.cpOut.x > maxX) maxX = pt.cpOut.x;
                    if (pt.cpOut.y > maxY) maxY = pt.cpOut.y;
                }
            });

            if (minX === maxX) maxX += 1;
            if (minY === maxY) maxY += 1;

            return {
                minX: Math.round(minX),
                minY: Math.round(minY),
                maxX: Math.round(maxX),
                maxY: Math.round(maxY),
                width: Math.max(20, Math.round(maxX - minX)),
                height: Math.max(20, Math.round(maxY - minY))
            };
        },

        /**
         * Çizim esnasında tuval üzerinde canlı kavis ve tanjant kolu önizlemesi çizer
         */
        drawTempPolygonCurve(ctx, points, cursor, s, isDraggingTangent, activePoint) {
            if (!points || points.length === 0) return;

            ctx.save();
            ctx.globalAlpha = s.opacity || 1;
            ctx.strokeStyle = s.color;
            ctx.lineWidth = s.width;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            if (!s.saber) {
                if (s.glow > 0) {
                    ctx.shadowBlur = s.glow;
                    ctx.shadowColor = s.color;
                } else {
                    ctx.shadowBlur = 0;
                    ctx.shadowColor = 'transparent';
                }
            }

            if (typeof getDash === 'function') {
                ctx.setLineDash(getDash(s.dashStyle, s.width));
            }

            // Dolgu önizlemesi
            if (s.fillOpacity > 0 && points.length >= 2) {
                ctx.save();
                if (s.fillGlow > 0) {
                    ctx.shadowBlur = s.fillGlow;
                    ctx.shadowColor = s.fillColor;
                } else {
                    ctx.shadowBlur = 0;
                    ctx.shadowColor = 'transparent';
                }
                ctx.globalAlpha = s.fillOpacity;
                ctx.fillStyle = s.fillColor;
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);

                for (let i = 1; i < points.length; i++) {
                    const prev = points[i - 1];
                    const curr = points[i];
                    if (prev.cpOut || curr.cpIn) {
                        const cp1 = prev.cpOut || prev;
                        const cp2 = curr.cpIn || curr;
                        ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, curr.x, curr.y);
                    } else {
                        ctx.lineTo(curr.x, curr.y);
                    }
                }

                if (cursor) {
                    const last = points[points.length - 1];
                    if (last.cpOut) {
                        ctx.bezierCurveTo(last.cpOut.x, last.cpOut.y, cursor.x, cursor.y, cursor.x, cursor.y);
                    } else {
                        ctx.lineTo(cursor.x, cursor.y);
                    }
                }

                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }

            // Çizgi önizlemesi
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);

            for (let i = 1; i < points.length; i++) {
                const prev = points[i - 1];
                const curr = points[i];
                if (prev.cpOut || curr.cpIn) {
                    const cp1 = prev.cpOut || prev;
                    const cp2 = curr.cpIn || curr;
                    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, curr.x, curr.y);
                } else {
                    ctx.lineTo(curr.x, curr.y);
                }
            }

            if (cursor) {
                const last = points[points.length - 1];
                if (last.cpOut) {
                    ctx.bezierCurveTo(last.cpOut.x, last.cpOut.y, cursor.x, cursor.y, cursor.x, cursor.y);
                } else {
                    ctx.lineTo(cursor.x, cursor.y);
                }
            }

            if (s.saber && typeof applyGlowAndStroke === 'function') {
                applyGlowAndStroke(ctx, s);
            } else {
                ctx.stroke();
            }

            // Köşe noktaları
            const showV = document.getElementById('polyShowVertices') ? document.getElementById('polyShowVertices').checked : true;
            if (showV) {
                points.forEach(pt => {
                    ctx.save();
                    ctx.fillStyle = pt.curve ? '#00e5ff' : s.color;
                    ctx.beginPath();
                    ctx.arc(pt.x, pt.y, s.width + (pt.curve ? 3 : 2), 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                });
            }

            // Çizim esnasında fare basılı sürükleniyorsa tanjant kolları ve kontrol noktalarını göster
            if (isDraggingTangent && activePoint && activePoint.cpOut && activePoint.cpIn) {
                ctx.save();
                ctx.strokeStyle = '#00e5ff';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([3, 3]);

                // Tanjant kolu
                ctx.beginPath();
                ctx.moveTo(activePoint.cpIn.x, activePoint.cpIn.y);
                ctx.lineTo(activePoint.cpOut.x, activePoint.cpOut.y);
                ctx.stroke();

                // Tanjant uç noktaları
                ctx.fillStyle = '#ffffff';
                ctx.strokeStyle = '#00e5ff';
                ctx.lineWidth = 2;
                ctx.setLineDash([]);

                [activePoint.cpIn, activePoint.cpOut].forEach(cp => {
                    ctx.beginPath();
                    ctx.arc(cp.x, cp.y, 5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                });

                ctx.restore();
            }

            ctx.restore();
        }
    };

    window.BezierCurves = BezierCurves;
})(window);
