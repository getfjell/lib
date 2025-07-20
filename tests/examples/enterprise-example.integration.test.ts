import { describe, expect, it, vi } from 'vitest';
import { runEnterpriseExample } from '../../examples/enterprise-example';

describe('Enterprise Example Integration', () => {
  it('should run enterprise example successfully', async () => {
    // Capture console.log output
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

    try {
      // Run the enterprise example
      await runEnterpriseExample();

      // Check that the completion message was logged
      const logCalls = consoleLogSpy.mock.calls.map(call => call[0]);
      const completionMessage = logCalls.find(msg =>
        typeof msg === 'string' && msg.includes('🎉 Enterprise patterns demonstration completed!')
      );

      expect(completionMessage).toBeDefined();
      expect(completionMessage).toContain('🎉 Enterprise patterns demonstration completed!');
    } finally {
      // Restore console.log
      consoleLogSpy.mockRestore();
    }
  });

  it('should log enterprise data models section', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

    try {
      await runEnterpriseExample();

      const logCalls = consoleLogSpy.mock.calls.map(call => call[0]);
      const dataModelsMessage = logCalls.find(msg =>
        typeof msg === 'string' && msg.includes('📊 ENTERPRISE DATA MODELS')
      );

      expect(dataModelsMessage).toBeDefined();
    } finally {
      consoleLogSpy.mockRestore();
    }
  });

  it('should log business logic section', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

    try {
      await runEnterpriseExample();

      const logCalls = consoleLogSpy.mock.calls.map(call => call[0]);
      const businessLogicMessage = logCalls.find(msg =>
        typeof msg === 'string' && msg.includes('🔧 BUSINESS LOGIC WITH ACTIONS & FACETS')
      );

      expect(businessLogicMessage).toBeDefined();
    } finally {
      consoleLogSpy.mockRestore();
    }
  });

  it('should create customer instances', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

    try {
      await runEnterpriseExample();

      const logCalls = consoleLogSpy.mock.calls.map(call => call[0]);
      const customerCreationMessage = logCalls.find(msg =>
        typeof msg === 'string' && msg.includes('Created customer:') && msg.includes('TechCorp Inc')
      );

      expect(customerCreationMessage).toBeDefined();
    } finally {
      consoleLogSpy.mockRestore();
    }
  });

  it('should create product instances', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

    try {
      await runEnterpriseExample();

      const logCalls = consoleLogSpy.mock.calls.map(call => call[0]);
      const productCreationMessage = logCalls.find(msg =>
        typeof msg === 'string' && msg.includes('Created product:') && msg.includes('Enterprise SaaS Platform')
      );

      expect(productCreationMessage).toBeDefined();
    } finally {
      consoleLogSpy.mockRestore();
    }
  });

  it('should create order instances with status and priority', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

    try {
      await runEnterpriseExample();

      const logCalls = consoleLogSpy.mock.calls.map(call => call[0]);
      const orderCreationMessage = logCalls.find(msg =>
        typeof msg === 'string' && msg.includes('Created order:') && msg.includes('(confirmed/high)')
      );

      expect(orderCreationMessage).toBeDefined();
    } finally {
      consoleLogSpy.mockRestore();
    }
  });

  it('should create support tickets with severity and category', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

    try {
      await runEnterpriseExample();

      const logCalls = consoleLogSpy.mock.calls.map(call => call[0]);
      const ticketCreationMessage = logCalls.find(msg =>
        typeof msg === 'string' && msg.includes('Created ticket:') && msg.includes('Critical System Outage')
      );

      expect(ticketCreationMessage).toBeDefined();
    } finally {
      consoleLogSpy.mockRestore();
    }
  });

  it('should demonstrate customer analytics functionality', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

    try {
      await runEnterpriseExample();

      const logCalls = consoleLogSpy.mock.calls.map(call => call[0]);
      const analyticsMessage = logCalls.find(msg =>
        typeof msg === 'string' && msg.includes('📊 Customer Analytics:')
      );

      expect(analyticsMessage).toBeDefined();
    } finally {
      consoleLogSpy.mockRestore();
    }
  });

  it('should demonstrate order fulfillment with tracking', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

    try {
      await runEnterpriseExample();

      const logCalls = consoleLogSpy.mock.calls.map(call => call[0]);
      const fulfillmentMessage = logCalls.find(msg =>
        typeof msg === 'string' && msg.includes('🚚 Fulfilling confirmed orders...')
      );

      expect(fulfillmentMessage).toBeDefined();
    } finally {
      consoleLogSpy.mockRestore();
    }
  });

  it('should demonstrate customer upgrade workflow', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

    try {
      await runEnterpriseExample();

      const logCalls = consoleLogSpy.mock.calls.map(call => call[0]);
      const upgradeMessage = logCalls.find(msg =>
        typeof msg === 'string' && msg.includes('⬆️ Customer Upgrades:')
      );

      expect(upgradeMessage).toBeDefined();
    } finally {
      consoleLogSpy.mockRestore();
    }
  });

  it('should demonstrate support analytics functionality', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

    try {
      await runEnterpriseExample();

      const logCalls = consoleLogSpy.mock.calls.map(call => call[0]);
      const supportAnalyticsMessage = logCalls.find(msg =>
        typeof msg === 'string' && msg.includes('🎫 Support Analytics:')
      );

      expect(supportAnalyticsMessage).toBeDefined();
    } finally {
      consoleLogSpy.mockRestore();
    }
  });

  it('should demonstrate cross-entity business intelligence', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

    try {
      await runEnterpriseExample();

      const logCalls = consoleLogSpy.mock.calls.map(call => call[0]);
      const businessIntelligenceMessage = logCalls.find(msg =>
        typeof msg === 'string' && msg.includes('4. Cross-Entity Business Intelligence:')
      );

      expect(businessIntelligenceMessage).toBeDefined();
    } finally {
      consoleLogSpy.mockRestore();
    }
  });

  it('should track platinum customers analytics', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

    try {
      await runEnterpriseExample();

      const logCalls = consoleLogSpy.mock.calls.map(call => call[0]);
      const platinumMessage = logCalls.find(msg =>
        typeof msg === 'string' && msg.includes('💎 Platinum customers:')
      );

      expect(platinumMessage).toBeDefined();
    } finally {
      consoleLogSpy.mockRestore();
    }
  });

  it('should log key achievements section', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

    try {
      await runEnterpriseExample();

      const logCalls = consoleLogSpy.mock.calls.map(call => call[0]);
      const achievementsMessage = logCalls.find(msg =>
        typeof msg === 'string' && msg.includes('📈 Key Achievements:')
      );

      expect(achievementsMessage).toBeDefined();
    } finally {
      consoleLogSpy.mockRestore();
    }
  });

  it('should validate specific achievement - clean separation of data operations', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

    try {
      await runEnterpriseExample();

      const logCalls = consoleLogSpy.mock.calls.map(call => call[0]);
      const achievementMessage = logCalls.find(msg =>
        typeof msg === 'string' && msg.includes('✅ Clean separation of data operations from business logic')
      );

      expect(achievementMessage).toBeDefined();
    } finally {
      consoleLogSpy.mockRestore();
    }
  });
});
