"use client";

import React, { useEffect, useRef } from "react";

export default function CyberMatrixCanvas() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", handleResize);

        // Mouse tracking for interactive 3D laser connections
        const mouse = { x: width / 2, y: height / 2, active: false };
        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            mouse.active = true;
        };
        window.addEventListener("mousemove", handleMouseMove);

        // 3D Perspective Grid
        let gridOffset = 0;
        const gridSpeed = 0.8;

        // Cyber Nodes/Particles
        interface Node {
            x: number;
            y: number;
            z: number;
            vx: number;
            vy: number;
            color: string;
            size: number;
        }

        const nodesCount = Math.min(60, Math.floor((width * height) / 25000));
        const nodes: Node[] = [];
        const colors = ["#ef4444", "#f87171", "#10b981", "#34d399", "#ef4444"]; // Crimson and Emerald focus

        for (let i = 0; i < nodesCount; i++) {
            nodes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                z: Math.random() * 2 + 0.5,
                vx: (Math.random() - 0.5) * 0.7,
                vy: (Math.random() - 0.5) * 0.7,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 2.5 + 1
            });
        }

        // Radar sweep angle
        let radarAngle = 0;

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            // 1. Draw Subtle Cyber Gradient Background
            const bgGrad = ctx.createRadialGradient(
                width / 2, height / 3, 50,
                width / 2, height / 2, Math.max(width, height) * 0.8
            );
            bgGrad.addColorStop(0, "rgba(24, 10, 16, 0.4)");
            bgGrad.addColorStop(0.5, "rgba(10, 15, 18, 0.6)");
            bgGrad.addColorStop(1, "rgba(8, 9, 11, 0.9)");
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, width, height);

            // 2. Draw Moving 3D Floor Grid
            gridOffset = (gridOffset + gridSpeed) % 40;
            ctx.strokeStyle = "rgba(239, 68, 68, 0.08)";
            ctx.lineWidth = 1;

            const horizonY = height * 0.55;
            const vanishingX = width * 0.5 + (mouse.active ? (mouse.x - width / 2) * 0.05 : 0);

            // Vertical lines converging to vanishing point
            const numVerts = 32;
            for (let i = -numVerts; i <= numVerts; i++) {
                const startX = vanishingX + i * (width / 16);
                ctx.beginPath();
                ctx.moveTo(vanishingX, horizonY);
                ctx.lineTo(startX * 3 - vanishingX * 2, height);
                ctx.stroke();
            }

            // Horizontal perspective lines moving towards viewer
            const numHoriz = 18;
            for (let i = 0; i < numHoriz; i++) {
                const progress = (i * 40 + gridOffset) / (numHoriz * 40);
                const y = horizonY + Math.pow(progress, 2.2) * (height - horizonY);
                const alpha = Math.min(1, progress * 1.5) * 0.12;
                ctx.strokeStyle = `rgba(239, 68, 68, ${alpha})`;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            // 3. Update & Draw Cyber Nodes and Laser Connections
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                node.x += node.vx * node.z;
                node.y += node.vy * node.z;

                if (node.x < 0 || node.x > width) node.vx = -node.vx;
                if (node.y < 0 || node.y > height) node.vy = -node.vy;

                // Draw node
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.size * node.z, 0, Math.PI * 2);
                ctx.fillStyle = node.color;
                ctx.shadowBlur = 10;
                ctx.shadowColor = node.color;
                ctx.fill();
                ctx.shadowBlur = 0; // reset

                // Connect with nearby nodes
                for (let j = i + 1; j < nodes.length; j++) {
                    const nodeB = nodes[j];
                    const dx = node.x - nodeB.x;
                    const dy = node.y - nodeB.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 140) {
                        const alpha = (1 - dist / 140) * 0.25;
                        ctx.strokeStyle = node.color === "#ef4444" || nodeB.color === "#ef4444"
                            ? `rgba(239, 68, 68, ${alpha})`
                            : `rgba(16, 185, 129, ${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(node.x, node.y);
                        ctx.lineTo(nodeB.x, nodeB.y);
                        ctx.stroke();
                    }
                }

                // Interactive connection to mouse
                if (mouse.active) {
                    const mdx = node.x - mouse.x;
                    const mdy = node.y - mouse.y;
                    const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
                    if (mDist < 180) {
                        const mAlpha = (1 - mDist / 180) * 0.45;
                        ctx.strokeStyle = `rgba(239, 68, 68, ${mAlpha})`;
                        ctx.lineWidth = 1.2;
                        ctx.beginPath();
                        ctx.moveTo(node.x, node.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                    }
                }
            }

            // 4. Subtle Radar Scanner Sweep in background top-right
            radarAngle = (radarAngle + 0.015) % (Math.PI * 2);
            const radarX = width - 180;
            const radarY = 180;
            const radarRadius = 110;

            ctx.strokeStyle = "rgba(239, 68, 68, 0.12)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(radarX, radarY, radarRadius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(radarX, radarY, radarRadius * 0.6, 0, Math.PI * 2);
            ctx.stroke();

            // Radar sweep sector
            ctx.fillStyle = "rgba(239, 68, 68, 0.03)";
            ctx.beginPath();
            ctx.moveTo(radarX, radarY);
            ctx.arc(radarX, radarY, radarRadius, radarAngle, radarAngle + 0.6);
            ctx.closePath();
            ctx.fill();

            // Radar line
            ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
            ctx.beginPath();
            ctx.moveTo(radarX, radarY);
            ctx.lineTo(
                radarX + Math.cos(radarAngle) * radarRadius,
                radarY + Math.sin(radarAngle) * radarRadius
            );
            ctx.stroke();

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0 w-full h-full opacity-90"
        />
    );
}
