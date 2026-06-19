---
title: Analytics & Stats
description: Monitoring flag performance and rollout metrics.
---

RocketFlag provides built-in analytics to help you understand how your features are performing in the wild. Analytics are available for Organisations on the **Teams** and **Ultra** tiers.

### How it Works

Every time a flag is evaluated via the RocketFlag API or SDK, the result (enabled or disabled) is recorded. This data is aggregated and processed to provide real-time insights into your feature rollouts.

### Viewing Stats

To view the analytics for a flag:
1. Navigate to your project.
2. Click on the flag name in the flags table to open the **Flag Details** drawer.
3. If analytics are enabled for your organisation, the usage data and charts will be displayed directly in the drawer. 
4. Data is shown for the **last 7 days**.

### Key Metrics

#### Total Hits
The total number of times the flag was requested from the API.

#### Decision Ratio
A breakdown of how often the flag evaluated to `true` vs. `false`. 
- For a flag with 100% traffic and no cohorts, the ratio should be 100% true.
- For a flag with 50% traffic, you should see a roughly 50/50 split.

#### Daily Usage Chart
A time-series chart showing the volume of hits per day, helping you identify trends or unexpected spikes in traffic.

### Multi-Environment Stats
For **Group Flags**, analytics are tracked separately for each environment. When you open the details for a Group Flag, the usage panel will display environment-specific breakdowns to help you see how a feature is performing in `Staging` vs. `Production`.

### Data Latency
Analytics data is processed in batches. While usage counts are updated frequently, there may be a delay of up to **10-15 minutes** before the latest hits appear in your dashboard charts.
