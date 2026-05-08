---
title: "Making peace with cold starts"
description: "I panicked at the p99 on my first Worker deploy. A week later I understood what I was actually measuring."
pubDate: 2026-05-07
tags: ["edge", "performans"]
translationKey: "cold-start-peace"
featured: true
---

Deployed my first Worker, looked at the dashboard. p99 was several times what I was used to from PHP-FPM. I panicked. I'd lived by p99 for years, the old number was familiar. Stayed up late. Cold start? Network? KV? Couldn't tell.

A week in I figured out that p99 wasn't hurting anyone. Almost all of the thousand requests were coming back fast, network and all, from the other side of the planet. The one slow one was the user's first touch, and yeah, it took a while. So when the high number happened, it was someone's first request. The page hadn't painted yet.

Cold start was bad when cold, sure. But the cold moment was the moment the user had just shown up. That overlap was quietly handling something on its own.

In PHP-FPM I obsessed over p99 because every request was potentially cold. My server was singular, always up, p99 meant "a bad moment." In Workers, p99 means "first touch." Same label, different question.

Some places it still bites. Real-time checkout — if the user's first request is the checkout page, that latency hurts. The first WebSocket handshake. API consumers that keep opening new cold connections. For those, either keep the Worker warm (Smart Placement, cron triggers) or look at a different runtime.

Everything else, cold start isn't the p99 I used to know. Now when I look at the chart I'm asking: this p99, for whom? Background sync, admin sign-in, the landing page's critical path. Three different answers.

Anyway. What I made peace with wasn't the number. It was the weight I'd put on it.
