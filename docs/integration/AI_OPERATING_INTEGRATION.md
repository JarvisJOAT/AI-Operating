# AI-Operating Integration Guide

Complete guide for integrating business applications with the AI-Operating platform.

## Overview

The AI-Operating platform serves as the central management hub for multiple business applications. Each app connects to the platform through:

1. **Authentication** - OAuth 2.0 / API Keys
2. **Data Sync** - Periodic synchronization
3. **Real-time Events** - Webhooks / WebSocket
4. **Management API** - Configuration and control

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AI-Operating Platform                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Admin Portal │  │ Customer UI  │  │    APIs      │              │
│  │              │  │              │  │              │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                  │                 │                       │
│         └──────────────────┼─────────────────┘                       │
│                            │                                         │
│                     ┌──────▼───────┐                                │
│                     │   Supabase   │                                │
│                     │   Database   │                                │
│                     │   + Auth     │                                │
│                     └──────┬───────┘                                │
│                            │                                         │
│              ┌─────────────┼─────────────┐                          │
│              │             │             │                          │
│      ┌───────▼───┐  ┌──────▼────┐ ┌─────▼──────┐                   │
│      │   Sync    │  │  Webhooks │ │  Realtime  │                   │
│      │   Engine  │  │  Handler  │ │  Listener  │                   │
│      └───────┬───┘  └──────┬────┘ └─────┬──────┘                   │
│              │             │            │                           │
└──────────────┼─────────────┼────────────┼───────────────────────────┘
               │             │            │
      ┌────────┴───────┬─────┴──────┬─────┴────────┐
      │                │            │              │
┌─────▼─────┐  ┌───────▼────┐ ┌─────▼────┐  ┌─────▼──────┐
│ Keys Open │  │   Food     │ │ Constr.  │  │   Future   │
│   Doors   │  │   Truck    │ │   Mgmt   │  │    Apps    │
└───────────┘  └────────────┘ └──────────┘  └────────────┘
```

## Integration Methods

### Method 1: Database Direct Access

For internal apps within the same Supabase project:

```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from './types/database';

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Access shared tables
const { data: organization } = await supabase
  .from('organizations')
  .select('*')
  .eq('id', organizationId)
  .single();
```

### Method 2: REST API

For external apps or microservices:

```typescript
// API client for AI-Operating
class AIOperatingClient {
  private baseUrl: string;
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.baseUrl = process.env.AI_OPERATING_API_URL!;
    this.apiKey = apiKey;
  }
  
  async syncData(appId: string, data: SyncPayload): Promise<SyncResult> {
    const response = await fetch(`${this.baseUrl}/api/sync/${appId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }
}
```

### Method 3: WebSocket Real-time

For live updates:

```typescript
const channel = supabase
  .channel('app-updates')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'app_instances',
      filter: `id=eq.${appInstanceId}`,
    },
    (payload) => {
      handleAppUpdate(payload);
    }
  )
  .subscribe();
```

## Authentication Flow

### JWT-Based Authentication

```
┌──────────┐          ┌─────────────────┐          ┌──────────────┐
│  Client  │          │  AI-Operating   │          │  Business    │
│  (User)  │          │    Platform     │          │     App      │
└────┬─────┘          └────────┬────────┘          └──────┬───────┘
     │                         │                          │
     │  1. Login Request       │                          │
     │────────────────────────▶│                          │
     │                         │                          │
     │  2. JWT Token           │                          │
     │◀────────────────────────│                          │
     │                         │                          │
     │  3. Access App with JWT │                          │
     │─────────────────────────┼─────────────────────────▶│
     │                         │                          │
     │                         │  4. Verify JWT           │
     │                         │◀─────────────────────────│
     │                         │                          │
     │                         │  5. User Info + Perms    │
     │                         │─────────────────────────▶│
     │                         │                          │
     │  6. Authenticated       │                          │
     │◀────────────────────────┼──────────────────────────│
     │                         │                          │
```

### Implementation

```typescript
// Middleware for business apps
import { createClient } from '@supabase/supabase-js';

const verifyToken = async (token: string): Promise<User | null> => {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return null;
  }
  
  // Get user's organization membership
  const { data: membership } = await supabase
    .from('organization_members')
    .select('*, organizations(*)')
    .eq('user_id', user.id)
    .single();
  
  return { ...user, membership };
};

// Express middleware
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const user = await verifyToken(token);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  req.user = user;
  next();
};
```

## Data Synchronization

### Sync Strategy

```typescript
interface SyncConfig {
  // Sync interval in milliseconds
  interval: number;
  
  // Tables to sync
  tables: {
    name: string;
    direction: 'push' | 'pull' | 'both';
    conflictResolution: 'local_wins' | 'remote_wins' | 'latest_wins';
    filter?: (row: any) => boolean;
  }[];
  
  // Batch size for large syncs
  batchSize: number;
  
  // Retry configuration
  retry: {
    maxAttempts: number;
    backoffMs: number;
  };
}

const defaultSyncConfig: SyncConfig = {
  interval: 5 * 60 * 1000, // 5 minutes
  tables: [
    {
      name: 'orders',
      direction: 'push',
      conflictResolution: 'latest_wins',
    },
    {
      name: 'configurations',
      direction: 'pull',
      conflictResolution: 'remote_wins',
    },
  ],
  batchSize: 100,
  retry: {
    maxAttempts: 3,
    backoffMs: 1000,
  },
};
```

### Sync Engine

```typescript
class SyncEngine {
  private config: SyncConfig;
  private lastSync: Record<string, Date>;
  
  constructor(config: SyncConfig) {
    this.config = config;
    this.lastSync = {};
  }
  
  async syncTable(tableName: string): Promise<SyncResult> {
    const tableConfig = this.config.tables.find(t => t.name === tableName);
    if (!tableConfig) throw new Error(`Table ${tableName} not configured`);
    
    const lastSyncTime = this.lastSync[tableName] || new Date(0);
    
    // Get changes since last sync
    const localChanges = await this.getLocalChanges(tableName, lastSyncTime);
    const remoteChanges = await this.getRemoteChanges(tableName, lastSyncTime);
    
    // Resolve conflicts
    const resolved = this.resolveConflicts(
      localChanges,
      remoteChanges,
      tableConfig.conflictResolution
    );
    
    // Apply changes
    if (tableConfig.direction !== 'pull') {
      await this.pushChanges(tableName, resolved.toRemote);
    }
    
    if (tableConfig.direction !== 'push') {
      await this.applyLocalChanges(tableName, resolved.toLocal);
    }
    
    this.lastSync[tableName] = new Date();
    
    return {
      tableName,
      pushed: resolved.toRemote.length,
      pulled: resolved.toLocal.length,
      conflicts: resolved.conflicts.length,
    };
  }
  
  async startPeriodicSync(): Promise<void> {
    setInterval(async () => {
      for (const table of this.config.tables) {
        try {
          await this.syncTable(table.name);
        } catch (error) {
          console.error(`Sync failed for ${table.name}:`, error);
        }
      }
    }, this.config.interval);
  }
}
```

### Sync Status Tracking

```sql
-- Sync logs table
CREATE TABLE sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_instance_id UUID REFERENCES app_instances(id),
  sync_type TEXT NOT NULL, -- 'full', 'incremental', 'manual'
  status TEXT NOT NULL, -- 'started', 'completed', 'failed'
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  records_pushed INT DEFAULT 0,
  records_pulled INT DEFAULT 0,
  error_message TEXT,
  metadata JSONB
);
```

## Webhooks

### Outbound Webhooks (Platform → App)

```typescript
// Webhook types
type WebhookEvent = 
  | 'config.updated'
  | 'app.enabled'
  | 'app.disabled'
  | 'user.added'
  | 'user.removed'
  | 'subscription.changed';

interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  app_instance_id: string;
  organization_id: string;
  data: Record<string, any>;
  signature: string;
}

// Webhook handler in business app
app.post('/webhooks/ai-operating', async (req, res) => {
  const payload = req.body as WebhookPayload;
  
  // Verify signature
  const isValid = verifyWebhookSignature(
    payload,
    req.headers['x-webhook-signature'],
    process.env.WEBHOOK_SECRET!
  );
  
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process event
  switch (payload.event) {
    case 'config.updated':
      await refreshConfiguration(payload.data);
      break;
    case 'app.disabled':
      await pauseOperations(payload.app_instance_id);
      break;
    // ... handle other events
  }
  
  res.status(200).json({ received: true });
});
```

### Inbound Webhooks (App → Platform)

```typescript
// Register webhook with platform
const registerWebhook = async (appInstanceId: string) => {
  await supabase.from('app_webhooks').insert({
    app_instance_id: appInstanceId,
    events: ['order.created', 'order.completed', 'error'],
    url: `${process.env.APP_URL}/webhooks/ai-operating`,
    secret: generateSecret(),
  });
};

// Send webhook to platform
const sendWebhook = async (event: string, data: any) => {
  const payload = {
    event,
    timestamp: new Date().toISOString(),
    app_instance_id: process.env.APP_INSTANCE_ID,
    data,
  };
  
  const signature = signPayload(payload, process.env.WEBHOOK_SECRET!);
  
  await fetch(`${process.env.AI_OPERATING_URL}/api/webhooks/receive`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signature,
    },
    body: JSON.stringify(payload),
  });
};
```

## API Integration Points

### App Registration

```typescript
// POST /api/apps/register
const registerApp = async (appData: AppRegistration) => {
  const { data: app } = await supabase
    .from('business_apps')
    .insert({
      name: appData.name,
      description: appData.description,
      icon_url: appData.iconUrl,
      capabilities: appData.capabilities,
      config_schema: appData.configSchema,
      webhook_events: appData.webhookEvents,
    })
    .select()
    .single();
  
  return app;
};
```

### App Instance Creation

```typescript
// POST /api/app-instances
const createAppInstance = async (
  organizationId: string,
  appId: string,
  config: AppConfig
) => {
  const { data: instance } = await supabase
    .from('app_instances')
    .insert({
      organization_id: organizationId,
      app_id: appId,
      status: 'provisioning',
      configuration: config,
    })
    .select()
    .single();
  
  // Initialize app-specific resources
  await initializeAppResources(instance.id, config);
  
  // Update status
  await supabase
    .from('app_instances')
    .update({ status: 'active' })
    .eq('id', instance.id);
  
  return instance;
};
```

### Configuration Management

```typescript
// GET /api/app-instances/:id/config
const getConfig = async (instanceId: string): Promise<AppConfig> => {
  const { data } = await supabase
    .from('app_instances')
    .select('configuration')
    .eq('id', instanceId)
    .single();
  
  return data?.configuration;
};

// PUT /api/app-instances/:id/config
const updateConfig = async (
  instanceId: string,
  updates: Partial<AppConfig>
): Promise<AppConfig> => {
  const current = await getConfig(instanceId);
  const merged = { ...current, ...updates };
  
  const { data } = await supabase
    .from('app_instances')
    .update({ configuration: merged })
    .eq('id', instanceId)
    .select('configuration')
    .single();
  
  // Notify app of config change
  await sendWebhook('config.updated', { config: data?.configuration });
  
  return data?.configuration;
};
```

## Testing Integration

### Unit Tests

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('AI-Operating Integration', () => {
  it('should verify JWT token', async () => {
    const token = await generateTestToken();
    const user = await verifyToken(token);
    expect(user).toBeDefined();
    expect(user.membership).toBeDefined();
  });
  
  it('should sync data successfully', async () => {
    const syncEngine = new SyncEngine(defaultSyncConfig);
    const result = await syncEngine.syncTable('orders');
    expect(result.status).toBe('success');
  });
  
  it('should handle webhook events', async () => {
    const payload = createTestWebhookPayload('config.updated');
    const response = await request(app)
      .post('/webhooks/ai-operating')
      .set('X-Webhook-Signature', signPayload(payload))
      .send(payload);
    expect(response.status).toBe(200);
  });
});
```

### Integration Tests

```typescript
describe('End-to-End Integration', () => {
  it('should create app instance and sync data', async () => {
    // Create instance
    const instance = await createAppInstance(testOrg.id, testApp.id, {});
    expect(instance.status).toBe('active');
    
    // Create data in app
    const order = await createOrder({ items: [...] });
    
    // Trigger sync
    await syncEngine.syncTable('orders');
    
    // Verify data in platform
    const platformOrder = await getPlatformOrder(order.id);
    expect(platformOrder).toBeDefined();
    expect(platformOrder.total).toBe(order.total);
  });
});
```

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Auth fails | Expired token | Refresh token |
| Sync conflict | Concurrent edits | Use conflict resolution |
| Webhook timeout | Slow handler | Use async processing |
| Missing data | Filter misconfigured | Check sync filters |

### Debug Mode

```typescript
// Enable debug logging
if (process.env.DEBUG_INTEGRATION) {
  supabase.on('request', (req) => {
    console.log('Supabase Request:', req);
  });
  
  syncEngine.on('sync', (result) => {
    console.log('Sync Result:', result);
  });
}
```

---

## Related Documentation

- [Deployment Strategy](./DEPLOYMENT_STRATEGY.md)
- [Unified API Reference](./API_REFERENCE.md)
- [Admin Dashboard Guide](../admin-training/ADMIN_DASHBOARD_GUIDE.md)

